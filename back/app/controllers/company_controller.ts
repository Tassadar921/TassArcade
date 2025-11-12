import { HttpContext } from '@adonisjs/core/http';
import { inject } from '@adonisjs/core';
import CompanyRepository from '#repositories/company_repository';
import {
    createCompanyValidator,
    getCompanyFromSiretValidator,
    getCompanyValidator,
    searchCompaniesValidator,
    updateCompanyValidator,
    deleteCompanyValidator,
    confirmCompanyValidator,
} from '#validators/company';
import axios from 'axios';
import env from '#start/env';
import Company from '#models/company';
import Address from '#models/address';
import CountryList, { Country } from 'country-list-with-dial-code-and-flag';
import CompanyAdministrator from '#models/company_administrator';
import CompanyAdministratorRoleEnum from '#types/enum/company_administrator_role_enum';
import NominatimService from '#services/nominatim_service';
import { parsePhoneNumberFromString, PhoneNumber } from 'libphonenumber-js';
import cache from '@adonisjs/cache/services/main';
import PaginatedCompanies from '#types/paginated/paginated_companies';
import SerializedCompany from '#types/serialized/serialized_company';
import CountryService from '#services/country_service';
import FileService from '#services/file_service';
import OpenAiApiService from '#services/open_ai_service';
import { OpenAiCompanyVerificationResult } from '#types/open-ai/open_ai_company_verification_result';
import { cuid } from '@adonisjs/core/helpers';
import app from '@adonisjs/core/services/app';
import File from '#models/file';
import path from 'node:path';
import FileTypeEnum from '#types/enum/file_type_enum';
import SlugifyService from '#services/slugify_service';

@inject()
export default class CompanyController {
    constructor(
        private readonly companyRepository: CompanyRepository,
        private readonly nominatimService: NominatimService,
        private readonly countryService: CountryService,
        private readonly fileService: FileService,
        private readonly openAiApiService: OpenAiApiService,
        private readonly slugifyService: SlugifyService
    ) {}

    public async getFromSiret({ request, response, i18n }: HttpContext): Promise<void> {
        const { siret } = await getCompanyFromSiretValidator.validate(request.params());

        try {
            const axiosResponse = await axios.get(`https://api.insee.fr/api-sirene/3.11/siret/${siret}`, {
                headers: {
                    'X-INSEE-Api-Key-Integration': env.get('INSEE_API_KEY'),
                },
            });

            if (axiosResponse.status !== 200) {
                throw axiosResponse;
            }

            return response.ok(axiosResponse.data.etablissement);
        } catch (error: any) {
            if (error.status === 404) {
                return response.notFound({
                    error: i18n.t('messages.company.siret.error.not-found'),
                });
            }

            return response.badRequest({
                error: i18n.t('messages.company.siret.error.default'),
            });
        }
    }

    public async create({ request, response, user, language, i18n }: HttpContext): Promise<void> {
        const { siret, name, address: inputAddress, postalCode, city, complement, countryCode, email, phoneNumber: inputPhoneNumber, logo } = await request.validateUsing(createCompanyValidator);

        let company: Company | null = await this.companyRepository.findOneBy({ siret });
        if (company) {
            return response.conflict({
                error: i18n.t('messages.company.create.error.already-exists', { siret }),
            });
        }

        const country: Country | undefined = CountryList.default.findOneByCountryCode(countryCode);
        if (!country) {
            return response.badRequest({
                error: i18n.t('messages.company.create.error.invalid-country-code', { countryCode }),
            });
        }

        let phoneNumber: PhoneNumber | undefined;
        if (inputPhoneNumber) {
            phoneNumber = parsePhoneNumberFromString(`${country.dialCode} ${inputPhoneNumber}`);
            if (!phoneNumber) {
                return response.badRequest({
                    error: i18n.t('messages.company.create.error.invalid-phone-number', { phoneNumber: inputPhoneNumber }),
                });
            }
        }

        const fullAddress: string = `${inputAddress}, ${postalCode} ${city}, ${country.name}`;
        const data: { latitude: number; longitude: number } | null = await this.nominatimService.getFromAddress(fullAddress);

        if (!data) {
            return response.badRequest({
                error: i18n.t('messages.company.create.error.invalid-address', { address: fullAddress }),
            });
        }

        const address: Address = await Address.create({
            address: inputAddress,
            postalCode,
            city,
            complement,
            country: country.name,
            latitude: data.latitude,
            longitude: data.longitude,
        });
        await address.refresh();

        company = await Company.create({
            siret,
            name,
            email,
            phoneNumber: phoneNumber?.format('E.164'),
            addressId: address.id,
        });
        await company.refresh();

        await CompanyAdministrator.create({
            role: CompanyAdministratorRoleEnum.CEO,
            companyId: company.id,
            userId: user.id,
        });

        if (logo) {
            company = await this.updateLogo(company, logo);
        }

        await Promise.all([company.load('address'), company.load('equipments'), company.load('logo'), cache.deleteByTag({ tags: ['companies'] })]);

        return response.created({
            message: i18n.t('messages.company.create.success', { companyName: company.name }),
            company: company.apiSerializeLight(language),
        });
    }

    public async getAll({ request, response, user, language }: HttpContext): Promise<void> {
        const { query, page, limit, sortBy: inputSortBy } = await request.validateUsing(searchCompaniesValidator);

        return response.ok(
            await cache.getOrSet({
                key: `companies:${user.id}:query:${query.toLowerCase()}:page:${page}:limit:${limit}:sortBy:${inputSortBy}`,
                tags: ['companies'],
                ttl: '1h',
                factory: async (): Promise<PaginatedCompanies> => {
                    const [field, order] = inputSortBy.split(':');
                    const sortBy = { field: field as keyof Company['$attributes'], order: order as 'asc' | 'desc' };

                    return await this.companyRepository.getProfileCompanies(user, language, query.toLowerCase(), page, limit, sortBy);
                },
            })
        );
    }

    public async delete({ request, response, i18n, user }: HttpContext): Promise<void> {
        const { companyId } = await request.validateUsing(deleteCompanyValidator);

        const statuses: { isDeleted: boolean; name?: string; id: string }[] = await this.companyRepository.delete([companyId], user);
        const status: { isDeleted: boolean; name?: string; id: string } = statuses[0];

        if (status.isDeleted) {
            await cache.deleteByTag({ tags: ['companies', `company:${status.id}`] });
            return response.ok({ messages: [{ message: i18n.t(`messages.company.delete.success`, { name: status.name }), isSuccess: true }] });
        } else {
            return response.ok({ messages: [{ message: i18n.t(`messages.company.delete.error.default`, { id: status.id }), isSuccess: false }] });
        }
    }

    public async update({ request, response, i18n, language, user }: HttpContext) {
        const { companyId, name, address: inputAddress, postalCode, city, complement, countryCode, email, phoneNumber: inputPhoneNumber, logo } = await request.validateUsing(updateCompanyValidator);

        const country: Country | undefined = CountryList.default.findOneByCountryCode(countryCode);
        if (!country) {
            return response.badRequest({
                error: i18n.t('messages.company.update.error.invalid-country-code', { countryCode }),
            });
        }

        let company: Company = await this.companyRepository.getFromUser(companyId, user);

        const fullAddress: string = `${inputAddress}, ${postalCode} ${city}, ${country.name}`;
        const data: { latitude: number; longitude: number } | null = await this.nominatimService.getFromAddress(fullAddress);

        if (!data) {
            return response.badRequest({
                error: i18n.t('messages.company.update.error.invalid-address', { address: fullAddress }),
            });
        }

        company.name = name;
        company.address.address = inputAddress;
        company.address.postalCode = postalCode;
        company.address.city = city;
        company.address.latitude = data.latitude;
        company.address.longitude = data.longitude;
        if (complement) {
            company.address.complement = complement;
        }
        if (email) {
            company.email = email;
        }

        let phoneNumber: PhoneNumber | undefined;
        if (inputPhoneNumber) {
            phoneNumber = parsePhoneNumberFromString(`${country.dialCode} ${inputPhoneNumber}`);
            if (!phoneNumber) {
                return response.badRequest({
                    error: i18n.t('messages.company.update.error.invalid-phone-number', { phoneNumber: inputPhoneNumber }),
                });
            }
            company.phoneNumber = phoneNumber.format('E.164');
        }

        if (logo) {
            company = await this.updateLogo(company, logo);
            await company.load('logo');
        }

        await Promise.all([
            company.save(),
            company.address.save(),
            cache.deleteByTag({ tags: ['companies'] }),
            cache.set({
                key: `company:${company.id}`,
                tags: [`company:${company.id}`],
                ttl: '1h',
                value: company.apiSerialize(language),
            }),
        ]);

        return response.ok({ company: company.apiSerializeLight(language), message: i18n.t('messages.company.update.success', { name }) });
    }

    public async get({ request, response, i18n, language }: HttpContext): Promise<void> {
        const { companyId } = await getCompanyValidator.validate(request.params());
        const company: Company | null = await this.companyRepository.findOneBy({ id: companyId }, ['administrators']);
        if (!company) {
            return response.notFound({ error: i18n.t('messages.company.get.error.not-found') });
        }

        return response.ok({
            company: await cache.getOrSet({
                key: `company:${company.id}`,
                tags: [`company:${company.id}`],
                ttl: '1h',
                factory: (): SerializedCompany => {
                    return company.apiSerialize(language);
                },
            }),
            countries: await cache.getOrSet({
                key: 'countries',
                tags: ['countries'],
                ttl: '24h',
                factory: async (): Promise<Country[]> => {
                    return await this.countryService.getAll();
                },
            }),
        });
    }

    public async confirm({ request, response, user, i18n, language }: HttpContext): Promise<void> {
        const { companyId, document } = await request.validateUsing(confirmCompanyValidator);
        if (!document.tmpPath) {
            return response.badRequest({ error: i18n.t('messages.company.confirm.error.no-document') });
        }

        const company: Company = await this.companyRepository.getFromUser(companyId, user);
        if (company.enabled) {
            return response.badRequest({ error: i18n.t('messages.company.confirm.error.already-enabled', { name: company.name }) });
        }

        const mimeType: string = `${document.type}/${document.subtype}`;
        const processedData: { mimeType: string; data: string }[] = await this.fileService.toBase64(document.tmpPath, mimeType);
        const returnedData: OpenAiCompanyVerificationResult | null = await this.openAiApiService.verifyCompanyDocument({
            documents: processedData.map((document: { mimeType: string; data: string }): { mimeType: string; data: string } => ({
                mimeType: document.mimeType,
                data: document.data,
            })),
            name: company.name,
            siret: company.siret,
            address: company.address.fullAddress,
            email: company.email,
            phone: company.phoneNumber,
        });

        if (!returnedData) {
            return response.badRequest({ error: i18n.t('messages.company.confirm.error.openai-error') });
        } else if (!returnedData.match) {
            return response.badRequest({ error: i18n.t('messages.company.confirm.error.openai-mismatch') });
        }

        company.enabled = true;

        await Promise.all([
            company.save(),
            cache.deleteByTag({ tags: ['companies'] }),
            cache.set({
                key: `company:${company.id}`,
                tags: [`company:${company.id}`],
                ttl: '1h',
                value: company.apiSerialize(language),
            }),
        ]);

        return response.ok({
            message: i18n.t('messages.company.confirm.success', { name: company.name }),
            company: company.apiSerialize(language),
        });
    }

    private async updateLogo(company: Company, logo: any): Promise<Company> {
        if (company.logoId) {
            // Physically delete the file
            this.fileService.delete(company.logo);

            const oldLogo: File = company.logo;
            company.logoId = null;
            await company.save();
            await oldLogo.delete();
        }

        logo.clientName = `${cuid()}-${this.slugifyService.slugify(logo.clientName)}`;
        const logoPath: string = `static/company-logo`;
        await logo.move(app.makePath(logoPath));
        const newLogo: File = await File.create({
            name: logo.clientName,
            path: `${logoPath}/${logo.clientName}`,
            extension: path.extname(logo.clientName),
            mimeType: `${logo.type}/${logo.subtype}`,
            size: logo.size,
            type: FileTypeEnum.COMPANY_LOGO,
        });

        company.logoId = newLogo.id;

        await Promise.all([
            newLogo.refresh(),
            cache.set({
                key: `company-logo:${company.id}`,
                tags: [`company:${company.id}`],
                ttl: '1h',
                value: app.makePath(newLogo.path),
            }),
        ]);

        return company;
    }
}

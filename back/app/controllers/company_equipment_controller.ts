import { inject } from '@adonisjs/core';
import CompanyRepository from '#repositories/company_repository';
import { HttpContext } from '@adonisjs/core/http';
import cache from '@adonisjs/cache/services/main';
import Company from '#models/company';
import SerializedCompany from '#types/serialized/serialized_company';
import CompanyEquipmentTypeRepository from '#repositories/company_equipment_type_repository';
import { companyIdValidator, createOrUpdateEquipmentValidator, getCompanyEquipmentsValidator, removeEquipmentValidator, searchCompanyEquipmentsValidator } from '#validators/company_equipment';
import SerializedCompanyEquipmentType from '#types/serialized/serialized_company_equipment_type';
import EquipmentRepository from '#repositories/equipment_repository';
import SerializedEquipment from '#types/serialized/serialized_equipment';
import EquipmentType from '#models/equipment_type';
import EquipmentTypeRepository from '#repositories/equipment_type_repository';
import CompanyEquipmentType from '#models/company_equipment_type';
import { Translation } from '@stouder-io/adonis-translatable';
import PaginatedCompanyAdministrators from '#types/paginated/paginated_company_administrators';
import CompanyAdministrator from '#models/company_administrator';
import User from '#models/user';

@inject()
export default class CompanyAdministratorController {
    constructor(
        private readonly companyRepository: CompanyRepository,
        private readonly companyEquipmentTypeRepository: CompanyEquipmentTypeRepository,
        private readonly equipmentTypeRepository: EquipmentTypeRepository,
        private readonly equipmentRepository: EquipmentRepository
    ) {}

    public async init({ request, response, language, user }: HttpContext) {
        const { companyId } = await getCompanyEquipmentsValidator.validate(request.params());
        const company: Company = await this.companyRepository.getFromUser(companyId, user);

        return response.ok({
            company: await cache.getOrSet({
                key: `company:${company.id}`,
                tags: [`company:${company.id}`],
                ttl: '1h',
                factory: (): SerializedCompany => {
                    return company.apiSerialize(language);
                },
            }),
            companyEquipments: await cache.getOrSet({
                key: `company-equipment-types:companyId:${companyId}`,
                tags: [`company:${companyId}`],
                ttl: '1h',
                factory: async (): Promise<SerializedCompanyEquipmentType[]> => {
                    return await this.companyEquipmentTypeRepository.getCompanyEquipments(company, language);
                },
            }),
            equipments: await cache.getOrSet({
                key: 'equipment-types',
                tags: ['equipment-types'],
                ttl: '24h',
                factory: async (): Promise<SerializedEquipment[]> => {
                    return await this.equipmentRepository.getEquipments(language);
                },
            }),
        });
    }

    public async getAll({ request, response, user }: HttpContext) {
        const { companyId } = await companyIdValidator.validate(request.params());
        const { query, page, limit, sortBy: inputSortBy } = await request.validateUsing(searchCompanyEquipmentsValidator);
        const company: Company = await this.companyRepository.getFromUser(companyId, user);

        return response.ok(
            await cache.getOrSet({
                key: `company-administrators:companyId:${companyId}:query:${query.toLowerCase()}:page:${page}:limit:${limit}:sortBy:${inputSortBy}`,
                tags: [`company:${companyId}`],
                ttl: '1h',
                factory: async (): Promise<PaginatedCompanyAdministrators> => {
                    const [field, order] = inputSortBy.split(':');
                    const sortBy = { field: field as keyof CompanyAdministrator['$attributes'] | `users.${keyof User['$attributes']}`, order: order as 'asc' | 'desc' };

                    return await this.companyAdministratorRepository.getAdministrators(company, query.toLowerCase(), page, limit, sortBy);
                },
            })
        );
    }

    public async addEquipment({ request, response, user, i18n, language }: HttpContext): Promise<void> {
        const { companyId } = await companyIdValidator.validate(request.params());
        const { equipmentId, name, description } = await request.validateUsing(createOrUpdateEquipmentValidator);
        const company: Company = await this.companyRepository.getFromUser(companyId, user);

        const equipmentType: EquipmentType = await this.equipmentTypeRepository.firstOrFail({ id: equipmentId });

        const companyEquipment: CompanyEquipmentType = await CompanyEquipmentType.create({
            companyId: company.id,
            equipmentTypeId: equipmentType.id,
            name: name ? Translation.from({ ...name }) : undefined,
            description: description ? Translation.from({ ...description }) : undefined,
        });

        await Promise.all([cache.deleteByTag({ tags: [`company:${companyId}`] })]);

        return response.ok({
            message: i18n.t('messages.equipment.add.success', { name: companyEquipment.name?.get(language.code) || '' }),
            companyEquipment: companyEquipment.apiSerialize(language),
        });
    }

    public async updateEquipment({ request, response, user, i18n }: HttpContext): Promise<void> {
        const { companyId } = await companyIdValidator.validate(request.params());
        const { equipmentId, name, description } = await request.validateUsing(createOrUpdateEquipmentValidator);
        const company: Company = await this.companyRepository.getFromUser(companyId, user);

        const companyEquipment: CompanyEquipmentType | null = await this.companyEquipmentTypeRepository.findOneBy({ id: equipmentId, companyId: company.id });
        if (!companyEquipment) {
            return response.notFound({
                error: i18n.t('messages.equipment.update.error.not-found'),
            });
        }

        companyEquipment.name = name ? Translation.from({ ...name }) : Translation.from({});
        companyEquipment.description = description ? Translation.from({ ...description }) : Translation.from({});

        await Promise.all([companyEquipment.save(), cache.deleteByTag({ tags: [`company:${companyId}`] })]);

        return response.ok({ message: i18n.t('messages.equipment.remove.success') });
    }

    public async removeEquipment({ request, response, user, i18n }: HttpContext): Promise<void> {
        const { companyId } = await companyIdValidator.validate(request.params());
        const { equipmentId } = await request.validateUsing(removeEquipmentValidator);
        const company: Company = await this.companyRepository.getFromUser(companyId, user);

        const companyEquipment: CompanyEquipmentType | null = await this.companyEquipmentTypeRepository.findOneBy({ id: equipmentId, companyId: company.id });
        if (!companyEquipment) {
            return response.notFound({
                error: i18n.t('messages.equipment.remove.error.not-found'),
            });
        }

        await Promise.all([companyEquipment.delete(), cache.deleteByTag({ tags: [`company:${companyId}`] })]);

        return response.ok({ message: i18n.t('messages.equipment.remove.success') });
    }
}

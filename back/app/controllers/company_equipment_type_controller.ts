import { inject } from '@adonisjs/core';
import CompanyRepository from '#repositories/company_repository';
import { HttpContext } from '@adonisjs/core/http';
import cache from '@adonisjs/cache/services/main';
import Company from '#models/company';
import SerializedCompany from '#types/serialized/serialized_company';
import CompanyEquipmentTypeRepository from '#repositories/company_equipment_type_repository';
import { companyIdValidator, createOrUpdateEquipmentValidator, getCompanyEquipmentsValidator, removeEquipmentValidator } from '#validators/company_equipment';
import EquipmentType from '#models/equipment_type';
import EquipmentTypeRepository from '#repositories/equipment_type_repository';
import CompanyEquipmentType from '#models/company_equipment_type';
import PaginatedCompanyEquipmentTypes from '#types/paginated/paginated_company_equipment_types';
import PaginatedEquipmentTypes from '#types/paginated/paginated_equipment_types';
import Equipment from '#models/equipment';
import EquipmentTranslation from '#models/equipment_translation';
import EquipmentTypeTranslation from '#models/equipment_type_translation';
import StringService from '#services/string_service';
import { DeleteCompanyEquipmentTypeResult } from '#types/delete_company_equipment_type_result';

@inject()
export default class CompanyAdministratorController {
    constructor(
        private readonly companyRepository: CompanyRepository,
        private readonly companyEquipmentTypeRepository: CompanyEquipmentTypeRepository,
        private readonly equipmentTypeRepository: EquipmentTypeRepository,
        private readonly stringService: StringService
    ) {}

    public async init({ request, response, language, user }: HttpContext) {
        const { companyId } = await companyIdValidator.validate(request.params());
        const company: Company = await this.companyRepository.getFromUser(companyId, user);

        return response.ok({
            company: await cache.getOrSet({
                key: `company:${company.id}`,
                tags: [`company:${company.id}`],
                ttl: '1h',
                factory: (): SerializedCompany => {
                    return company.apiSerialize();
                },
            }),
            companyEquipments: await cache.getOrSet({
                key: `company-equipment-types:companyId:${companyId}:query::page:1:limit:10:sortBy:company_equipment_types.name:asc`,
                tags: [`company:${companyId}`],
                ttl: '1h',
                factory: async (): Promise<PaginatedCompanyEquipmentTypes> => {
                    return await this.companyEquipmentTypeRepository.getCompanyEquipments(company, language, '', 1, 10, { field: 'company_equipment_types.name', order: 'asc' });
                },
            }),
            equipments: await cache.getOrSet({
                key: 'equipment-types:query::page:1:limit:10:sortBy:name:asc',
                tags: ['equipment-types'],
                ttl: '24h',
                factory: async (): Promise<PaginatedEquipmentTypes> => {
                    return await this.equipmentTypeRepository.getEquipments(language, '', 1, 10, { field: 'equipment_type_translations.name', order: 'asc' });
                },
            }),
        });
    }

    public async getAll({ request, response, user, language }: HttpContext) {
        const { companyId } = await companyIdValidator.validate(request.params());
        const { query, page, limit, sortBy: inputSortBy } = await request.validateUsing(getCompanyEquipmentsValidator);
        const company: Company = await this.companyRepository.getFromUser(companyId, user);

        return response.ok(
            await cache.getOrSet({
                key: `company-equipment-types:companyId:${companyId}:query:${query.toLowerCase()}:page:${page}:limit:${limit}:sortBy:${inputSortBy}`,
                tags: [`company:${companyId}`],
                ttl: '1h',
                factory: async (): Promise<PaginatedCompanyEquipmentTypes> => {
                    const [field, order] = inputSortBy.split(':');
                    const sortBy = {
                        field: this.stringService.toSnakeCase(field) as
                            | `company_equipment_types.${keyof CompanyEquipmentType['$attributes']}`
                            | `equipments.${keyof Equipment['$attributes']}`
                            | `equipment_translations.${keyof EquipmentTranslation['$attributes']}`
                            | `equipment_types.${keyof EquipmentType['$attributes']}`
                            | `equipment_type_translations.${keyof EquipmentTypeTranslation['$attributes']}`,
                        order: order as 'asc' | 'desc',
                    };

                    return await this.companyEquipmentTypeRepository.getCompanyEquipments(company, language, query.toLowerCase(), page, limit, sortBy);
                },
            })
        );
    }

    public async addEquipment({ request, response, user, i18n, language }: HttpContext) {
        const { companyId } = await companyIdValidator.validate(request.params());
        const { equipmentTypeId } = await request.validateUsing(createOrUpdateEquipmentValidator);

        const company: Company = await this.companyRepository.getFromUser(companyId, user);

        const equipmentType: EquipmentType = await this.equipmentTypeRepository.getOneAndTranslation(equipmentTypeId, language);

        const companyEquipment: CompanyEquipmentType = await CompanyEquipmentType.create({
            companyId: company.id,
            equipmentTypeId: equipmentType.id,
        });

        await Promise.all([cache.deleteByTag({ tags: [`company:${companyId}`] })]);

        return response.ok({
            message: i18n.t('messages.company.equipment.add.success', { name: companyEquipment.name || equipmentType.translations[0].name || '' }),
        });
    }

    public async updateEquipment({ request, response, user, i18n }: HttpContext) {
        const { companyId } = await companyIdValidator.validate(request.params());
        const { companyEquipmentTypeId, equipmentTypeId, name, description } = await request.validateUsing(createOrUpdateEquipmentValidator);
        const company: Company = await this.companyRepository.getFromUser(companyId, user);

        const companyEquipment: CompanyEquipmentType | null = await this.companyEquipmentTypeRepository.findOneBy({ id: companyEquipmentTypeId, companyId: company.id });
        if (!companyEquipment) {
            return response.notFound({
                error: i18n.t('messages.company.equipment.update.error.not-found'),
            });
        }

        await this.equipmentTypeRepository.firstOrFail({ id: equipmentTypeId });

        companyEquipment.name = name;
        companyEquipment.description = description;
        companyEquipment.equipmentTypeId = equipmentTypeId;

        await Promise.all([companyEquipment.save(), cache.deleteByTag({ tags: [`company:${companyId}`] })]);

        return response.ok({ message: i18n.t('messages.company.equipment.delete.success') });
    }

    public async removeEquipment({ request, response, user, i18n, language }: HttpContext) {
        const { companyId } = await companyIdValidator.validate(request.params());
        const { equipmentIds } = await request.validateUsing(removeEquipmentValidator);
        const company: Company = await this.companyRepository.getFromUser(companyId, user);

        const statuses: DeleteCompanyEquipmentTypeResult[] = await this.companyEquipmentTypeRepository.delete(equipmentIds, company, language);

        return response.ok({
            messages: await Promise.all(
                statuses.map(async (status: DeleteCompanyEquipmentTypeResult): Promise<{ id: string; message: string; isSuccess: boolean }> => {
                    if (status.isDeleted) {
                        await cache.deleteByTag({ tags: [`company:${companyId}`] });
                        return { id: status.id, message: i18n.t(`messages.company.equipment.remove.success`, { name: status.name }), isSuccess: true };
                    } else {
                        if (status.isFound) {
                            return { id: status.id, message: i18n.t(`messages.company.equipment.remove.error.default`, { name: status.name }), isSuccess: false };
                        } else {
                            return { id: status.id, message: i18n.t(`messages.company.equipment.remove.error.not-found`, { id: status.id }), isSuccess: false };
                        }
                    }
                })
            ),
        });
    }
}

import { inject } from '@adonisjs/core';
import CompanyRepository from '#repositories/company_repository';
import { HttpContext } from '@adonisjs/core/http';
import cache from '@adonisjs/cache/services/main';
import Company from '#models/company';
import SerializedCompany from '#types/serialized/serialized_company';
import CompanyEquipmentTypeRepository from '#repositories/company_equipment_type_repository';
import { companyIdValidator, createOrUpdateEquipmentValidator, getCompanyEquipmentsValidator, removeEquipmentValidator, searchCompanyEquipmentsValidator } from '#validators/company_equipment';
import EquipmentType from '#models/equipment_type';
import EquipmentTypeRepository from '#repositories/equipment_type_repository';
import CompanyEquipmentType from '#models/company_equipment_type';
import PaginatedCompanyEquipmentTypes from '#types/paginated/paginated_company_equipment_types';
import PaginatedEquipmentTypes from '#types/paginated/paginated_equipment_types';

@inject()
export default class CompanyAdministratorController {
    constructor(
        private readonly companyRepository: CompanyRepository,
        private readonly companyEquipmentTypeRepository: CompanyEquipmentTypeRepository,
        private readonly equipmentTypeRepository: EquipmentTypeRepository
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
                    return company.apiSerialize();
                },
            }),
            companyEquipments: await cache.getOrSet({
                key: `company-equipment-types:companyId:${companyId}:query::page:1:limit:10`,
                tags: [`company:${companyId}`],
                ttl: '1h',
                factory: async (): Promise<PaginatedCompanyEquipmentTypes> => {
                    return await this.companyEquipmentTypeRepository.getCompanyEquipments(company, language, '', 1, 10);
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
        const { query, page, limit } = await request.validateUsing(searchCompanyEquipmentsValidator);
        const company: Company = await this.companyRepository.getFromUser(companyId, user);

        return response.ok(
            await cache.getOrSet({
                key: `company-equipment-types:companyId:${companyId}:query:${query.toLowerCase()}:page:${page}:limit:${limit}`,
                tags: [`company:${companyId}`],
                ttl: '1h',
                factory: async (): Promise<PaginatedCompanyEquipmentTypes> => {
                    return await this.companyEquipmentTypeRepository.getCompanyEquipments(company, language, query.toLowerCase(), page, limit);
                },
            })
        );
    }

    public async addEquipment({ request, response, user, i18n, language }: HttpContext): Promise<void> {
        const { companyId } = await companyIdValidator.validate(request.params());
        const { equipmentTypeId, name, description } = await request.validateUsing(createOrUpdateEquipmentValidator);
        const company: Company = await this.companyRepository.getFromUser(companyId, user);

        const equipmentType: EquipmentType = await this.equipmentTypeRepository.getOneAndTranslation(equipmentTypeId, language);

        const companyEquipment: CompanyEquipmentType = await CompanyEquipmentType.create({
            companyId: company.id,
            equipmentTypeId: equipmentType.id,
            name: name,
            description: description,
        });

        await Promise.all([cache.deleteByTag({ tags: [`company:${companyId}`] })]);

        return response.ok({
            message: i18n.t('messages.equipment.add.success', { name: companyEquipment.name || equipmentType.translations[0].name || '' }),
            companyEquipment: companyEquipment.apiSerialize(),
        });
    }

    public async updateEquipment({ request, response, user, i18n }: HttpContext): Promise<void> {
        const { companyId } = await companyIdValidator.validate(request.params());
        const { companyEquipmentTypeId, equipmentTypeId, name, description } = await request.validateUsing(createOrUpdateEquipmentValidator);
        const company: Company = await this.companyRepository.getFromUser(companyId, user);

        const companyEquipment: CompanyEquipmentType | null = await this.companyEquipmentTypeRepository.findOneBy({ id: companyEquipmentTypeId, companyId: company.id });
        if (!companyEquipment) {
            return response.notFound({
                error: i18n.t('messages.equipment.update.error.not-found'),
            });
        }

        await this.equipmentTypeRepository.firstOrFail({ id: equipmentTypeId });

        companyEquipment.name = name;
        companyEquipment.description = description;
        companyEquipment.equipmentTypeId = equipmentTypeId;

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

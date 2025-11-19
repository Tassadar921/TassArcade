import { inject } from '@adonisjs/core';
import CompanyRepository from '#repositories/company_repository';
import { HttpContext } from '@adonisjs/core/http';
import cache from '@adonisjs/cache/services/main';
import Company from '#models/company';
import SerializedCompany from '#types/serialized/serialized_company';
import CompanyEquipmentTypeRepository from '#repositories/company_equipment_type_repository';
import PaginatedCompanyEquipmentTypes from '#types/paginated/paginated_company_equipment_types';
import { getCompanyEquipmentsValidator } from '#validators/company_equipment';

@inject()
export default class CompanyAdministratorController {
    constructor(
        private readonly companyRepository: CompanyRepository,
        private readonly companyEquipmentRepository: CompanyEquipmentTypeRepository
    ) {}

    public async getAll({ request, response, language, i18n }: HttpContext) {
        const { companyId } = await request.validateUsing(getCompanyEquipmentsValidator);
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
            equipments: await cache.getOrSet({
                key: `company-equipment-types:companyId:${companyId}:query::page:1:limit:10:sortBy:username:asc`,
                tags: [`company:${companyId}`],
                ttl: '1h',
                factory: async (): Promise<PaginatedCompanyEquipmentTypes> => {
                    return await this.companyEquipmentRepository.getCompanyEquipments(company, language, '', 1, 10, { field: 'username', order: 'asc' });
                },
            }),
        });
    }
}

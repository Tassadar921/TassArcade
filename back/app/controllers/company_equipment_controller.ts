import { inject } from '@adonisjs/core';
import CompanyRepository from '#repositories/company_repository';
import { HttpContext } from '@adonisjs/core/http';
import cache from '@adonisjs/cache/services/main';
import Company from '#models/company';
import SerializedCompany from '#types/serialized/serialized_company';
import CompanyEquipmentTypeRepository from '#repositories/company_equipment_type_repository';
import { getCompanyEquipmentsValidator } from '#validators/company_equipment';
import SerializedCompanyEquipmentType from '#types/serialized/serialized_company_equipment_type';

@inject()
export default class CompanyAdministratorController {
    constructor(
        private readonly companyRepository: CompanyRepository,
        private readonly companyEquipmentRepository: CompanyEquipmentTypeRepository
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
            equipments: await cache.getOrSet({
                key: `company-equipment-types:companyId:${companyId}`,
                tags: [`company:${companyId}`],
                ttl: '1h',
                factory: async (): Promise<SerializedCompanyEquipmentType[]> => {
                    return await this.companyEquipmentRepository.getCompanyEquipments(company, language);
                },
            }),
        });
    }
}

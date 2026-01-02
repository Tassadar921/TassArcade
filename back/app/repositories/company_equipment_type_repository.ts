import BaseRepository from '#repositories/base/base_repository';
import CompanyEquipmentType from '#models/company_equipment_type';
import Company from '#models/company';
import SerializedCompanyEquipmentType from '#types/serialized/serialized_company_equipment_type';
import Language from '#models/language';
import { ModelPaginatorContract, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model';
import PaginatedCompanyEquipmentTypes from '#types/paginated/paginated_company_equipment_types';

export default class CompanyEquipmentTypeRepository extends BaseRepository<typeof CompanyEquipmentType> {
    constructor() {
        super(CompanyEquipmentType);
    }

    public async getCompanyEquipments(company: Company, language: Language, query: string, page: number, limit: number): Promise<PaginatedCompanyEquipmentTypes> {
        const paginator: ModelPaginatorContract<CompanyEquipmentType> = await this.Model.query()
            .select('company_equipment_types.*')
            .leftJoin('equipment_types', 'company_equipment_types.equipment_type_id', 'equipment_types.id')
            .leftJoin('equipments', 'equipment_types.equipment_id', 'equipments.id')
            .if(query, (queryBuilder: ModelQueryBuilderContract<typeof CompanyEquipmentType>): void => {
                queryBuilder.where((subQuery: ModelQueryBuilderContract<typeof CompanyEquipmentType>): void => {
                    subQuery
                        .whereRaw(`company_equipment_types.name->>'${language.code}' ILIKE ?`, [`%${query}%`])
                        .orWhereRaw(`company_equipment_types.description->>'${language.code}' ILIKE ?`, [`%${query}%`])
                        .orWhereRaw(`equipment_types.name->>'${language.code}' ILIKE ?`, [`%${query}%`])
                        .orWhere('equipment_types.code', 'ILIKE', `%${query}%`)
                        .orWhereRaw(`equipments.name->>'${language.code}' ILIKE ?`, [`%${query}%`])
                        .orWhere('equipments.category', 'ILIKE', `%${query}%`);
                });
            })
            .where('company_equipment_types.company_id', company.id)
            .paginate(page, limit);

        return {
            equipmentTypes: paginator.all().map((equipment: CompanyEquipmentType): SerializedCompanyEquipmentType => equipment.apiSerialize(language)),
            firstPage: paginator.firstPage,
            lastPage: paginator.lastPage,
            limit,
            total: paginator.total,
            currentPage: paginator.currentPage,
        };
    }
}

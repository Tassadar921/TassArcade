import BaseRepository from '#repositories/base/base_repository';
import CompanyEquipmentType from '#models/company_equipment_type';
import Company from '#models/company';
import PaginatedCompanyEquipmentTypes from '#types/paginated/paginated_company_equipment_types';
import EquipmentType from '#models/equipment_type';
import Equipment from '#models/equipment';
import { ModelPaginatorContract, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model';
import SerializedCompanyEquipmentType from '#types/serialized/serialized_company_equipment_type';
import Language from '#models/language';

interface OrderBy {
    field: keyof CompanyEquipmentType['$attributes'] | keyof EquipmentType['$attributes'] | keyof Equipment['$attributes'];
    order: 'asc' | 'desc';
}

export default class CompanyEquipmentTypeRepository extends BaseRepository<typeof CompanyEquipmentType> {
    constructor() {
        super(CompanyEquipmentType);
    }

    public async getCompanyEquipments(company: Company, language: Language, query: string, page: number, limit: number, orderBy: OrderBy): Promise<PaginatedCompanyEquipmentTypes> {
        const paginator: ModelPaginatorContract<CompanyEquipmentType> = await this.Model.query()
            .select('company_equipment_types.*', 'equipment_types.name', 'equipment_types.description', 'equipments.name')
            .leftJoin('equipment_types', 'company_equipment_types.equipmentTypeId', 'equipment_types.id')
            .leftJoin('equipments', 'company_equipment_types.equipmentId', 'equipments.id')
            .if(query, (queryBuilder: ModelQueryBuilderContract<typeof CompanyEquipmentType>): void => {
                queryBuilder.where('equipment_types.name', 'ILIKE', `%${query}%`).orWhere('equipment_types.description', 'ILIKE', `%${query}%`);
            })
            .if(orderBy, (queryBuilder: ModelQueryBuilderContract<typeof CompanyEquipmentType>): void => {
                queryBuilder.orderBy(orderBy.field as string, orderBy.order);
            })
            .where('company_equipment_types.companyId', company.id)
            .preload('equipmentType')
            .paginate(page, limit);

        return {
            equipmentTypes: paginator.all().map((equipmentType: CompanyEquipmentType): SerializedCompanyEquipmentType => equipmentType.apiSerialize(language)),
            firstPage: paginator.firstPage,
            lastPage: paginator.lastPage,
            limit,
            total: paginator.total,
            currentPage: paginator.currentPage,
        };
    }
}

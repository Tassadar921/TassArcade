import { DateTime } from 'luxon';
import { afterCreate, afterUpdate, BaseModel, belongsTo, column } from '@adonisjs/lucid/orm';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';
import Company from '#models/company';
import EquipmentType from '#models/equipment_type';
import { SerializedCompanyEquipmentType } from '#types/serialized/serialized_company_equipment_type';

export default class CompanyEquipmentType extends BaseModel {
    public static table: string = 'company_equipment_types';

    @column({ isPrimary: true })
    declare id: string;

    @column()
    declare name: string | undefined;

    @column()
    declare description: string | undefined;

    @column()
    declare companyId: string;

    @belongsTo((): typeof Company => Company)
    declare company: BelongsTo<typeof Company>;

    @column()
    declare equipmentTypeId: string;

    @belongsTo((): typeof EquipmentType => EquipmentType)
    declare equipmentType: BelongsTo<typeof EquipmentType>;

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime;

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime;

    @afterCreate()
    @afterUpdate()
    public static async refresh(companyEquipment: CompanyEquipmentType): Promise<void> {
        await companyEquipment.refresh();
    }

    public apiSerialize(): SerializedCompanyEquipmentType {
        return {
            id: this.id,
            name: this.name ?? undefined,
            description: this.description ?? undefined,
            category: this.equipmentType.equipment.apiSerializeLight(),
            type: this.equipmentType.apiSerialize(),
            createdAt: this.createdAt.toString(),
            updatedAt: this.updatedAt.toString(),
        };
    }
}

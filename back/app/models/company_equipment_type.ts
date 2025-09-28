import { DateTime } from 'luxon';
import { BaseModel, beforeFetch, beforeFind, belongsTo, column } from '@adonisjs/lucid/orm';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';
import Company from '#models/company';
import EquipmentType from '#models/equipment_type';

export default class CompanyEquipmentType extends BaseModel {
    @column({ isPrimary: true })
    declare id: string;

    @column()
    declare companyId: string;

    @belongsTo((): typeof Company => Company)
    declare company: BelongsTo<typeof Company>;

    @column()
    declare equipmentTypeId: string;

    @belongsTo((): typeof EquipmentType => EquipmentType)
    declare equipment: BelongsTo<typeof EquipmentType>;

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime;

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime;

    @beforeFind()
    @beforeFetch()
    public static preloadDefaults(companyAdministratorQuery: any): void {
        companyAdministratorQuery.preload('equipment');
    }
}

import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm';
import { DateTime } from 'luxon';
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations';
import EquipmentTypeTranslation from '#models/equipment_type_translation';
import Equipment from '#models/equipment';

export default class EquipmentType extends BaseModel {
    @column({ isPrimary: true })
    declare id: string;

    @column()
    declare code: string;

    @column()
    declare equipmentId: string;

    @belongsTo((): typeof Equipment => Equipment)
    declare equipment: BelongsTo<typeof Equipment>;

    @hasMany((): typeof EquipmentTypeTranslation => EquipmentTypeTranslation)
    declare translations: HasMany<typeof EquipmentTypeTranslation>;

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime;

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime;
}

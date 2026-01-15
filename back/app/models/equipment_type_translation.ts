import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm';
import { DateTime } from 'luxon';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';
import Language from '#models/language';
import EquipmentType from '#models/equipment_type';

export default class EquipmentTypeTranslation extends BaseModel {
    public static table: string = 'equipment_type_translations';

    @column({ isPrimary: true })
    declare id: string;

    @column()
    declare name: string;

    @column()
    declare equipmentTypeId: string;

    @belongsTo((): typeof EquipmentType => EquipmentType, {
        foreignKey: 'equipmentTypeId',
    })
    declare equipmentType: BelongsTo<typeof EquipmentType>;

    @column()
    declare languageId: string;

    @belongsTo((): typeof Language => Language, {
        foreignKey: 'languageId',
    })
    declare language: BelongsTo<typeof Language>;

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime;

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime;
}

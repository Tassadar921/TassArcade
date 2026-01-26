import { afterCreate, afterUpdate, BaseModel, belongsTo, column } from '@adonisjs/lucid/orm';
import { DateTime } from 'luxon';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';
import Equipment from '#models/equipment';
import Language from '#models/language';

export default class EquipmentTranslation extends BaseModel {
    public static table: string = 'equipment_translations';

    @column({ isPrimary: true })
    declare id: string;

    @column()
    declare name: string;

    @column()
    declare equipmentId: string;

    @belongsTo((): typeof Equipment => Equipment, {
        foreignKey: 'equipmentId',
    })
    declare equipment: BelongsTo<typeof Equipment>;

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

    @afterCreate()
    @afterUpdate()
    public static async refresh(equipmentTranslation: EquipmentTranslation): Promise<void> {
        await equipmentTranslation.refresh();
    }
}

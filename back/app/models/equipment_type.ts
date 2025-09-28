import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm';
import { DateTime } from 'luxon';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';
import Equipment from '#models/equipment';
import { Translation } from '@stouder-io/adonis-translatable';
import Language from '#models/language';
import SerializedEquipmentType from '#types/serialized/serialized_equipment_type';

export default class EquipmentType extends BaseModel {
    @column({ isPrimary: true })
    declare id: string;

    @column()
    declare code: string;

    @column()
    declare name: Translation;

    @column()
    declare equipmentId: string;

    @belongsTo((): typeof Equipment => Equipment)
    declare equipment: BelongsTo<typeof Equipment>;

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime;

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime;

    public apiSerialize(language: Language): SerializedEquipmentType {
        return {
            id: this.id,
            name: this.name.get(language.code) || this.name.get(Language.LANGUAGE_ENGLISH.code) || '',
            createdAt: this.createdAt?.toString(),
            updatedAt: this.updatedAt?.toString(),
        };
    }
}

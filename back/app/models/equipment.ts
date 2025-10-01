import { BaseModel, beforeFetch, beforeFind, belongsTo, column, hasMany } from '@adonisjs/lucid/orm';
import { DateTime } from 'luxon';
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations';
import File from '#models/file';
import { translation, Translation } from '@stouder-io/adonis-translatable';
import Language from '#models/language';
import EquipmentType from '#models/equipment_type';
import SerializedEquipmentType from '#types/serialized/serialized_equipment_type';
import SerializedEquipment from '#types/serialized/serialized_equipment';

export default class Equipment extends BaseModel {
    public static table: string = 'equipments';

    @column({ isPrimary: true })
    declare id: string;

    @translation()
    declare name: Translation;

    @column()
    declare category: string;

    @column()
    declare thumbnailId: string;

    @belongsTo((): typeof File => File, {
        foreignKey: 'thumbnailId',
    })
    declare thumbnail: BelongsTo<typeof File>;

    @hasMany((): typeof EquipmentType => EquipmentType)
    declare types: HasMany<typeof EquipmentType>;

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime;

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime;

    @beforeFind()
    @beforeFetch()
    public static preloadDefaults(userQuery: any): void {
        userQuery.preload('thumbnail');
    }

    public apiSerialize(language: Language): SerializedEquipment {
        return {
            id: this.id,
            name: this.name.get(language.code) || this.name.get(Language.LANGUAGE_ENGLISH.code) || '',
            category: this.category,
            thumbnail: this.thumbnail.apiSerialize(),
            types: this.types
                .map((type: EquipmentType): SerializedEquipmentType => type.apiSerialize(language))
                .sort((a: SerializedEquipmentType, b: SerializedEquipmentType): number => a.name.localeCompare(b.name)),
            createdAt: this.createdAt?.toString(),
            updatedAt: this.updatedAt?.toString(),
        };
    }
}

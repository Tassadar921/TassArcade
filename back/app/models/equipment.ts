import { afterCreate, afterUpdate, BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm';
import { DateTime } from 'luxon';
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations';
import File from '#models/file';
import EquipmentType from '#models/equipment_type';
import SerializedEquipmentType from '#types/serialized/serialized_equipment_type';
import SerializedEquipment from '#types/serialized/serialized_equipment';
import SerializedEquipmentLight from '#types/serialized/serialized_equipment_light';
import EquipmentTranslation from '#models/equipment_translation';

export default class Equipment extends BaseModel {
    public static table: string = 'equipments';

    @column({ isPrimary: true })
    declare id: string;

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

    @hasMany((): typeof EquipmentTranslation => EquipmentTranslation)
    declare translations: HasMany<typeof EquipmentTranslation>;

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime;

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime;

    @afterCreate()
    @afterUpdate()
    public static async refresh(equipment: Equipment): Promise<void> {
        await equipment.refresh();
    }

    public apiSerialize(): SerializedEquipment {
        return {
            id: this.id,
            name: this.translations[0].name,
            category: this.category,
            thumbnail: this.thumbnail.apiSerialize(),
            types: this.types
                .map((type: EquipmentType): SerializedEquipmentType => type.apiSerialize())
                .sort((a: SerializedEquipmentType, b: SerializedEquipmentType): number => a.name.localeCompare(b.name)),
            createdAt: this.createdAt.toString(),
            updatedAt: this.updatedAt.toString(),
        };
    }

    public apiSerializeLight(): SerializedEquipmentLight {
        return {
            id: this.id,
            name: this.translations[0].name,
            category: this.category,
            thumbnail: this.thumbnail.apiSerialize(),
            createdAt: this.createdAt.toString(),
            updatedAt: this.updatedAt.toString(),
        };
    }
}

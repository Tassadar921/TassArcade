import { afterCreate, afterUpdate, BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm';
import { DateTime } from 'luxon';
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations';
import Equipment from '#models/equipment';
import SerializedEquipmentType from '#types/serialized/serialized_equipment_type';
import SerializedEquipmentTypeExtended from '#types/serialized/serialized_equipment_type_extended';
import EquipmentTypeTranslation from '#models/equipment_type_translation';

export default class EquipmentType extends BaseModel {
    public static table: string = 'equipment_types';

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

    @afterCreate()
    @afterUpdate()
    public static async refresh(equipmentType: EquipmentType): Promise<void> {
        await equipmentType.refresh();
    }

    public apiSerialize(): SerializedEquipmentType {
        return {
            id: this.id,
            name: this.translations?.length ? this.translations[0].name : '',
            createdAt: this.createdAt.toString(),
            updatedAt: this.updatedAt.toString(),
        };
    }

    public apiSerializeExtended(): SerializedEquipmentTypeExtended {
        return {
            id: this.id,
            name: this.translations?.length ? this.translations[0].name : '',
            equipment: this.equipment.apiSerializeLight(),
            createdAt: this.createdAt.toString(),
            updatedAt: this.updatedAt.toString(),
        };
    }
}

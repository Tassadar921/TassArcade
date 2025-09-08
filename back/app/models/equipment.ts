import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm';
import { DateTime } from 'luxon';
import EquipmentTranslation from '#models/equipment_translation';
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations';
import File from '#models/file';

export default class Equipment extends BaseModel {
    @column({ isPrimary: true })
    declare id: string;

    @column()
    declare frontId: number;

    @column()
    declare pictureId: string | null;

    @belongsTo((): typeof File => File, {
        foreignKey: 'pictureId',
    })
    declare picture: BelongsTo<typeof File>;

    @hasMany((): typeof EquipmentTranslation => EquipmentTranslation)
    declare translations: HasMany<typeof EquipmentTranslation>;

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime;

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime;
}

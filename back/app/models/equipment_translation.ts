import { BaseModel, beforeFetch, beforeFind, belongsTo, column } from '@adonisjs/lucid/orm';
import { DateTime } from 'luxon';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';
import Equipment from '#models/equipment';
import Language from '#models/language';

export default class EquipmentTranslation extends BaseModel {
    @column({ isPrimary: true })
    declare id: string;

    @column()
    declare frontId: number;

    @column()
    declare name: string;

    @column()
    declare equipmentId: string;

    @belongsTo((): typeof Equipment => Equipment)
    declare equipment: BelongsTo<typeof Equipment>;

    @column()
    declare languageId: string;

    @belongsTo((): typeof Language => Language)
    declare language: BelongsTo<typeof Language>;

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime;

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime;

    @beforeFind()
    @beforeFetch()
    public static preloadDefaults(companyAdministratorQuery: any): void {
        companyAdministratorQuery.preload('language');
    }
}

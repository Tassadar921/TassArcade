import { DateTime } from 'luxon';
import { BaseModel, beforeFetch, beforeFind, belongsTo, column } from '@adonisjs/lucid/orm';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';
import Company from '#models/company';
import EquipmentType from '#models/equipment_type';
import { Translation, translation } from '@stouder-io/adonis-translatable';
import Language from '#models/language';
import { SerializedCompanyEquipmentType } from '#types/serialized/serialized_company_equipment_type';

export default class CompanyEquipmentType extends BaseModel {
    public static table: string = 'company_equipment_types';

    @column({ isPrimary: true })
    declare id: string;

    @translation()
    declare description: Translation;

    @column()
    declare companyId: string;

    @belongsTo((): typeof Company => Company)
    declare company: BelongsTo<typeof Company>;

    @column()
    declare equipmentTypeId: string;

    @belongsTo((): typeof EquipmentType => EquipmentType)
    declare equipmentType: BelongsTo<typeof EquipmentType>;

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime;

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime;

    @beforeFind()
    @beforeFetch()
    public static preloadDefaults(companyEquipmentTypeQuery: any): void {
        companyEquipmentTypeQuery.preload('equipmentType');
    }

    public apiSerialize(language: Language): SerializedCompanyEquipmentType {
        return {
            id: this.id,
            name: this.equipmentType.name.get(language.code) || this.equipmentType.name.get(Language.LANGUAGE_ENGLISH.code) || '',
            description: this.description?.get(language.code) || this.description?.get(Language.LANGUAGE_ENGLISH.code) || undefined,
            createdAt: this.createdAt?.toString(),
            updatedAt: this.updatedAt?.toString(),
        };
    }
}

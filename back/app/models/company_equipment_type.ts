import { DateTime } from 'luxon';
import { afterCreate, BaseModel, beforeFetch, beforeFind, belongsTo, column } from '@adonisjs/lucid/orm';
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
    declare name: Translation;

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
        companyEquipmentTypeQuery.preload('equipmentType', (equipmentTypeQuery: any): void => {
            equipmentTypeQuery.preload('equipment');
        });
    }

    @afterCreate()
    public static async refresh(companyEquipment: CompanyEquipmentType): Promise<void> {
        await companyEquipment.load('equipmentType', (equipmentTypeQuery: any): void => {
            equipmentTypeQuery.preload('equipment');
        });
        await companyEquipment.refresh();
    }

    public apiSerialize(language: Language): SerializedCompanyEquipmentType {
        return {
            id: this.id,
            category: this.equipmentType.equipment.apiSerializeLight(language),
            type: this.equipmentType.apiSerialize(language),
            name: this.name.get(language.code) || this.name.get(Language.LANGUAGE_ENGLISH.code) || '',
            description: this.description?.get(language.code) || this.description?.get(Language.LANGUAGE_ENGLISH.code) || undefined,
            createdAt: this.createdAt?.toString(),
            updatedAt: this.updatedAt?.toString(),
        };
    }
}

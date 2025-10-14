import { DateTime } from 'luxon';
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm';
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations';
import Address from '#models/address';
import CompanyAdministrator from '#models/company_administrator';
import SerializedCompany from '#types/serialized/serialized_company';
import CompanyEquipmentType from '#models/company_equipment_type';
import Language from '#models/language';
import { SerializedCompanyEquipmentType } from '../types/index.js';

export default class Company extends BaseModel {
    public static table: string = 'companies';

    @column({ isPrimary: true })
    declare id: string;

    @column()
    declare siret: string;

    @column()
    declare name: string;

    @column()
    declare email: string;

    @column()
    declare phoneNumber: string;

    @column()
    declare addressId: string;

    @belongsTo((): typeof Address => Address)
    declare address: BelongsTo<typeof Address>;

    @hasMany((): typeof CompanyAdministrator => CompanyAdministrator)
    declare administrators: HasMany<typeof CompanyAdministrator>;

    @hasMany((): typeof CompanyEquipmentType => CompanyEquipmentType)
    declare equipments: HasMany<typeof CompanyEquipmentType>;

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime;

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime;

    public apiSerialize(language: Language): SerializedCompany {
        return {
            id: this.id,
            name: this.name,
            address: this.address.apiSerialize(),
            equipments: this.equipments
                .map((equipmentType: CompanyEquipmentType): SerializedCompanyEquipmentType => equipmentType.apiSerialize(language))
                .sort((a: SerializedCompanyEquipmentType, b: SerializedCompanyEquipmentType): number => a.name.localeCompare(b.name)),
            createdAt: this.createdAt.toString(),
            updatedAt: this.updatedAt.toString(),
        };
    }
}

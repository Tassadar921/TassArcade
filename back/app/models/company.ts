import { DateTime } from 'luxon';
import { BaseModel, beforeFetch, beforeFind, belongsTo, column, hasMany } from '@adonisjs/lucid/orm';
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations';
import Address from '#models/address';
import CompanyAdministrator from '#models/company_administrator';
import CompanyEquipmentType from '#models/company_equipment_type';
import Language from '#models/language';
import SerializedCompanyLight from '#types/serialized/serialized_company_light';
import File from '#models/file';
import SerializedCompanyEquipmentType from '#types/serialized/serialized_company_equipment_type';
import SerializedCompany from '#types/serialized/serialized_company';

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
    declare enabled: boolean;

    @column()
    declare logoId: string;

    @belongsTo((): typeof File => File, {
        foreignKey: 'logoId',
    })
    declare logo: BelongsTo<typeof File>;

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

    @beforeFind()
    @beforeFetch()
    public static preloadDefaults(userQuery: any): void {
        userQuery.preload('address').preload('equipments').preload('logo');
    }

    public apiSerializeLight(language: Language): SerializedCompanyLight {
        return {
            id: this.id,
            name: this.name,
            logo: this.logo?.apiSerialize(),
            address: this.address.apiSerialize(),
            equipments: this.equipments
                .map((equipmentType: CompanyEquipmentType): SerializedCompanyEquipmentType => equipmentType.apiSerialize(language))
                .sort((a: SerializedCompanyEquipmentType, b: SerializedCompanyEquipmentType): number => a.name.localeCompare(b.name)),
            createdAt: this.createdAt.toString(),
            updatedAt: this.updatedAt.toString(),
        };
    }

    public apiSerialize(language: Language): SerializedCompany {
        return {
            id: this.id,
            siret: this.siret,
            name: this.name,
            phoneNumber: this.phoneNumber,
            email: this.email,
            enabled: this.enabled,
            logo: this.logo?.apiSerialize(),
            address: this.address.apiSerialize(),
            equipments: this.equipments
                .map((equipmentType: CompanyEquipmentType): SerializedCompanyEquipmentType => equipmentType.apiSerialize(language))
                .sort((a: SerializedCompanyEquipmentType, b: SerializedCompanyEquipmentType): number => a.name.localeCompare(b.name)),
            createdAt: this.createdAt.toString(),
            updatedAt: this.updatedAt.toString(),
        };
    }
}

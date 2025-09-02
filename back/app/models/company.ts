import { DateTime } from 'luxon';
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm';
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations';
import Address from '#models/address';
import CompanyAdministrator from '#models/company_administrator';
import SerializedCompany from '#types/serialized/serialized_company';
import SerializedCompanyAdministrator from '#types/serialized/serialized_company_administrator';

export default class Company extends BaseModel {
    @column({ isPrimary: true })
    declare id: string;

    @column()
    declare frontId: number;

    @column()
    declare name: string;

    @column()
    declare addressId: string;

    @belongsTo((): typeof Address => Address)
    declare address: BelongsTo<typeof Address>;

    @hasMany((): typeof CompanyAdministrator => CompanyAdministrator)
    declare administrators: HasMany<typeof CompanyAdministrator>;

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime;

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime;

    public apiSerialize(): SerializedCompany {
        return {
            id: this.frontId,
            name: this.name,
            address: this.address.apiSerialize(),
            administrators: this.administrators.map((administrator: CompanyAdministrator): SerializedCompanyAdministrator => administrator.apiSerialize()),
            createdAt: this.createdAt.toString(),
            updatedAt: this.updatedAt.toString(),
        };
    }
}

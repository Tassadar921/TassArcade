import { DateTime } from 'luxon';
import { BaseModel, beforeFetch, beforeFind, belongsTo, column } from '@adonisjs/lucid/orm';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';
import Company from '#models/company';
import User from '#models/user';
import SerializedCompanyAdministrator from '#types/serialized/serialized_company_administrator';
import CompanyAdministratorRoleEnum from '#types/enum/company_administrator_role_enum';

export default class CompanyAdministrator extends BaseModel {
    @column({ isPrimary: true })
    declare id: string;

    @column()
    declare frontId: number;

    @column()
    declare role: CompanyAdministratorRoleEnum;

    @column()
    declare companyId: string;

    @belongsTo((): typeof Company => Company)
    declare company: BelongsTo<typeof Company>;

    @column()
    declare userId: string;

    @belongsTo((): typeof User => User)
    declare user: BelongsTo<typeof User>;

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime;

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime;

    @beforeFind()
    @beforeFetch()
    public static preloadDefaults(companyAdministratorQuery: any): void {
        companyAdministratorQuery.preload('user');
    }

    public apiSerialize(): SerializedCompanyAdministrator {
        return {
            id: this.frontId,
            role: this.role,
            user: this.user.apiSerialize(),
            updatedAt: this.updatedAt.toString(),
            createdAt: this.createdAt.toString(),
        };
    }
}

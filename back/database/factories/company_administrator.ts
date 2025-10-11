import Factory from '@adonisjs/lucid/factories';
import CompanyAdministrator from '#models/company_administrator';
import CompanyAdministratorRoleEnum from '#types/enum/company_administrator_role_enum';

export const CompanyAdministratorFactory = Factory.define(CompanyAdministrator, () => {
    return {
        role: CompanyAdministratorRoleEnum.ADMINISTRATOR,
    };
}).build();

import { BaseCommand } from '@adonisjs/core/ace';
import type { CommandOptions } from '@adonisjs/core/types/ace';
import { CompanyFactory, AddressFactory, UserFactory, CompanyAdministratorFactory } from '#database/factories/company';
import Address from '#models/address';
import User from '#models/user';
import Company from '#models/company';
import CompanyAdministratorRoleEnum from '#types/enum/company_administrator_role_enum';

export default class ExecTest extends BaseCommand {
    public companiesAmount: number = 3;

    public static commandName: string = 'db:factory:company';
    public static description: string = 'This command creates companies';

    public static options: CommandOptions = {
        startApp: true,
    };

    public async run(): Promise<void> {
        const addresses: Address[] = await AddressFactory.createMany(this.companiesAmount);
        const ceos: User[] = await UserFactory.createMany(this.companiesAmount);
        const administrators: User[] = await UserFactory.createMany(this.companiesAmount);
        const companies: Company[] = await CompanyFactory.merge(addresses.map((address: Address): { addressId: string } => ({ addressId: address.id }))).createMany(this.companiesAmount);
        await CompanyAdministratorFactory.merge(
            ceos.map((ceo: User, index: number): { userId: string; role: CompanyAdministratorRoleEnum; companyId: string } => ({
                userId: ceo.id,
                role: CompanyAdministratorRoleEnum.CEO,
                companyId: companies[index].id,
            }))
        ).createMany(this.companiesAmount);
        await CompanyAdministratorFactory.merge(
            administrators.map((administrator: User, index: number): { userId: string; companyId: string } => ({
                userId: administrator.id,
                companyId: companies[index].id,
            }))
        ).createMany(this.companiesAmount);
    }
}

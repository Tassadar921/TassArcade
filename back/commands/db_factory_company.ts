import { BaseCommand } from '@adonisjs/core/ace';
import type { CommandOptions } from '@adonisjs/core/types/ace';
import { CompanyFactory } from '#database/factories/company';
import { FranceAddressFactory } from '#database/factories/address';
import { UserFactory } from '#database/factories/user';
import { CompanyAdministratorFactory } from '#database/factories/company_administrator';
import Address from '#models/address';
import User from '#models/user';
import Company from '#models/company';
import CompanyAdministratorRoleEnum from '#types/enum/company_administrator_role_enum';
import EquipmentType from '#models/equipment_type';
import EquipmentTypeRepository from '#repositories/equipment_type_repository';
import { CompanyEquipmentTypeFactory } from '#database/factories/company_equipment_type';

export default class DbFactoryCompany extends BaseCommand {
    public readonly equipmentTypeRepository: EquipmentTypeRepository = new EquipmentTypeRepository();
    public companiesAmount: number = 50;

    public static commandName: string = 'db:factory:company';
    public static description: string = 'This command creates companies';

    public static options: CommandOptions = {
        startApp: true,
    };

    public async run(): Promise<void> {
        this.logger.info('1/7 Creating addresses...');
        let addresses: Address[] = await FranceAddressFactory.createMany(this.companiesAmount);

        this.logger.info('2/7 Creating CEOs...');
        const ceos: User[] = await UserFactory.createMany(this.companiesAmount);

        this.logger.info('3/7 Creating administrators...');
        const administrators: User[] = await UserFactory.createMany(this.companiesAmount);

        this.logger.info('4/7 Creating companies...');
        const companies: Company[] = await CompanyFactory.merge(addresses.map((address: Address): { addressId: string } => ({ addressId: address.id }))).createMany(this.companiesAmount);

        this.logger.info('5/7 Creating company administrators...');
        await CompanyAdministratorFactory.merge(
            ceos.map((ceo: User, index: number): { userId: string; role: CompanyAdministratorRoleEnum; companyId: string } => ({
                userId: ceo.id,
                role: CompanyAdministratorRoleEnum.CEO,
                companyId: companies[index].id,
            }))
        ).createMany(this.companiesAmount);

        this.logger.info('6/7 Creating company administrators...');
        await CompanyAdministratorFactory.merge(
            administrators.map((administrator: User, index: number): { userId: string; companyId: string } => ({
                userId: administrator.id,
                companyId: companies[index].id,
            }))
        ).createMany(this.companiesAmount);

        this.logger.info('7/7 Creating company equipment types...');
        const equipmentTypes: EquipmentType[] = await this.equipmentTypeRepository.all();
        await Promise.all(
            companies.map(async (company: Company): Promise<void> => {
                for (let i = 0; i < Math.round(Math.random() * 10); i++) {
                    await CompanyEquipmentTypeFactory.merge({
                        companyId: company.id,
                        equipmentTypeId: equipmentTypes[Math.floor(Math.random() * equipmentTypes.length)].id,
                    }).create();
                }
            })
        );
    }
}

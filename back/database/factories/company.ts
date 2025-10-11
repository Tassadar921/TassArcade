import Factory from '@adonisjs/lucid/factories';
import { FactoryContextContract } from '@adonisjs/lucid/types/factory';
import Company from '#models/company';

export const CompanyFactory = Factory.define(Company, ({ faker }: FactoryContextContract) => {
    return {
        name: faker.company.name(),
    };
}).build();

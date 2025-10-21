import Factory from '@adonisjs/lucid/factories';
import { FactoryContextContract } from '@adonisjs/lucid/types/factory';
import Company from '#models/company';

export const CompanyFactory = Factory.define(Company, ({ faker }: FactoryContextContract) => {
    return {
        name: faker.company.name(),
        siret: faker.number.int({ min: 1000000000000, max: 9999999999999 }),
        email: faker.internet.email(),
        phoneNumber: faker.phone.number(),
    };
}).build();

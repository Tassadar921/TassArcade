import User from '#models/user';
import Factory from '@adonisjs/lucid/factories';
import UserRoleEnum from '#types/enum/user_role_enum';
import { FactoryContextContract } from '@adonisjs/lucid/types/factory';
import Address from '#models/address';
import Company from '#models/company';

export const AddressFactory = Factory.define(Address, ({ faker }: FactoryContextContract) => {
    return {
        streetNumber: faker.location.buildingNumber(),
        isBis: faker.datatype.boolean({ probability: 0.1 }),
        street: faker.location.street(),
        zipCode: faker.location.zipCode(),
        city: faker.location.city(),
        complement: faker.location.secondaryAddress(),
        country: faker.location.country(),
        latitude: faker.location.latitude(),
        longitude: faker.location.longitude(),
    };
}).build();

export const CompanyFactory = Factory.define(Company, ({ faker }: FactoryContextContract) => {
    return {
        name: faker.company.name(),
    };
}).build();

export const UserFactory = Factory.define(User, ({ faker }: FactoryContextContract) => {
    return {
        username: faker.internet.username(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        role: UserRoleEnum.USER,
        enabled: true,
        acceptedTermsAndConditions: true,
    };
}).build();

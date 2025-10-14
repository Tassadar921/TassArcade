import Factory from '@adonisjs/lucid/factories';
import { FactoryContextContract } from '@adonisjs/lucid/types/factory';
import Address from '#models/address';

export const AddressFactory = Factory.define(Address, ({ faker }: FactoryContextContract) => {
    return {
        address: faker.location.streetAddress(),
        zipCode: faker.location.zipCode(),
        city: faker.location.city(),
        complement: faker.location.secondaryAddress(),
        country: faker.location.country(),
        latitude: faker.location.latitude(),
        longitude: faker.location.longitude(),
    };
}).build();

export const FranceAddressFactory = Factory.define(Address, ({ faker }: FactoryContextContract) => {
    return {
        address: faker.location.streetAddress(),
        postalCode: faker.location.zipCode(),
        city: faker.location.city(),
        complement: faker.location.secondaryAddress(),
        country: 'France',
        latitude: faker.location.latitude({ min: 41.3, max: 51.1 }),
        longitude: faker.location.longitude({ min: -5.1, max: 9.6 }),
    };
}).build();

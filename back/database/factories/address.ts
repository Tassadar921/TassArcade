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

import Factory from '@adonisjs/lucid/factories';
import CompanyEquipmentType from '#models/company_equipment_type';
import { FactoryContextContract } from '@adonisjs/lucid/types/factory';

export const CompanyEquipmentTypeFactory = Factory.define(CompanyEquipmentType, ({ faker }: FactoryContextContract) => {
    return {
        name: Math.random() > 0.5 ? faker.lorem.sentence({ min: 1, max: 5 }) : undefined,
        description: Math.random() > 0.5 ? faker.lorem.sentence({ min: 1, max: 5 }) : undefined,
    };
}).build();

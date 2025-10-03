import Factory from '@adonisjs/lucid/factories';
import CompanyEquipmentType from '#models/company_equipment_type';
import { FactoryContextContract } from '@adonisjs/lucid/types/factory';
import { Translation } from '@stouder-io/adonis-translatable';

export const CompanyEquipmentTypeFactory = Factory.define(CompanyEquipmentType, ({ faker }: FactoryContextContract) => {
    return {
        description: Math.random() > 0.5 ? Translation.from({ en: faker.lorem.sentence({ min: 1, max: 5}), fr: faker.lorem.sentence({ min: 1, max: 5}) }) : undefined,
    };
}).build();

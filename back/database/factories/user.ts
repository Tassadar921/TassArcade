import User from '#models/user';
import Factory from '@adonisjs/lucid/factories';
import UserRoleEnum from '#types/enum/user_role_enum';
import { FactoryContextContract } from '@adonisjs/lucid/types/factory';
import { cuid } from '@adonisjs/core/helpers';

export const UserFactory = Factory.define(User, ({ faker }: FactoryContextContract) => {
    return {
        username: faker.internet.username(),
        email: `user_${cuid()}@${faker.internet.domainName()}`,
        password: faker.internet.password(),
        role: UserRoleEnum.USER,
        enabled: true,
        acceptedTermsAndConditions: true,
    };
}).build();

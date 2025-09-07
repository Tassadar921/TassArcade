import { BaseSchema } from '@adonisjs/lucid/schema';
import { Knex } from 'knex';

export default class extends BaseSchema {
    protected tableName: string = 'company_administrators';

    async up(): Promise<void> {
        this.schema.createTable(this.tableName, (table: Knex.CreateTableBuilder): void => {
            table.uuid('id').primary().defaultTo(this.raw('uuid_generate_v4()'));
            table.specificType('front_id', 'serial').notNullable();
            table.string('role', 100).notNullable();
            table.uuid('company_id').notNullable().references('id').inTable('companies');
            table.uuid('user_id').notNullable().references('id').inTable('users');
            table.timestamp('created_at');
            table.timestamp('updated_at');
        });
    }

    async down(): Promise<void> {
        this.schema.dropTable(this.tableName);
    }
}

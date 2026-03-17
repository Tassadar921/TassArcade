import { BaseSchema } from '@adonisjs/lucid/schema';
import { Knex } from 'knex';

export default class extends BaseSchema {
    protected tableName: string = 'equipment_translations';

    async up(): Promise<void> {
        this.schema.createTable(this.tableName, (table: Knex.CreateTableBuilder): void => {
            table.uuid('id').primary().defaultTo(this.raw('uuid_generate_v4()'));
            table.string('name').notNullable();
            table.uuid('equipment_id').notNullable().references('id').inTable('equipments').onDelete('CASCADE');
            table.uuid('language_id').notNullable().references('id').inTable('languages');
            table.timestamp('created_at');
            table.timestamp('updated_at');
        });
    }

    async down(): Promise<void> {
        this.schema.dropTable(this.tableName);
    }
}

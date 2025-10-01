import { BaseSchema } from '@adonisjs/lucid/schema';
import { Knex } from 'knex';

export default class extends BaseSchema {
    protected tableName: string = 'addresses';

    async up(): Promise<void> {
        this.schema.createTable(this.tableName, (table: Knex.CreateTableBuilder): void => {
            table.uuid('id').primary().defaultTo(this.raw('uuid_generate_v4()'));
            table.string('street_number', 10).notNullable();
            table.boolean('is_bis').defaultTo(false);
            table.string('street', 100).notNullable();
            table.string('zip_code', 10).notNullable();
            table.string('city', 100).notNullable();
            table.string('complement', 100).nullable();
            table.string('country', 100).notNullable();
            table.float('latitude').notNullable();
            table.float('longitude').notNullable();
            table.string('geohash', 12).nullable();
            table.timestamp('created_at');
            table.timestamp('updated_at');

            table.index(['geohash']);
            table.index(['latitude', 'longitude']);
        });
    }

    async down(): Promise<void> {
        this.schema.dropTable(this.tableName);
    }
}

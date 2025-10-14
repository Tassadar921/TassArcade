import { BaseModel, beforeSave, column } from '@adonisjs/lucid/orm';
import { DateTime } from 'luxon';
import SerializedAddress from '#types/serialized/serialized_address';
import ngeohash from 'ngeohash';

export default class Address extends BaseModel {
    public static table: string = 'addresses';

    @column({ isPrimary: true })
    declare id: string;

    @column()
    declare address: string;

    @column()
    declare zipCode: string;

    @column()
    declare city: string;

    @column()
    declare complement: string;

    @column()
    declare country: string;

    @column()
    declare latitude: number;

    @column()
    declare longitude: number;

    @column()
    public geohash: string = '';

    @beforeSave()
    public static setGeohash(address: Address): void {
        if (address.latitude && address.longitude) {
            address.geohash = ngeohash.encode(address.latitude, address.longitude);
        }
    }

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime;

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime;

    get fullAddress(): string {
        return `${this.address}, ${this.zipCode} ${this.city}, ${this.complement}, ${this.country}`;
    }

    get encodedAddress(): string {
        return encodeURIComponent(this.fullAddress);
    }

    public apiSerialize(): SerializedAddress {
        return {
            id: this.id,
            address: this.address,
            zipCode: this.zipCode,
            city: this.city,
            country: this.country,
            complement: this.complement,
            fullAddress: this.fullAddress,
            encodedAddress: this.encodedAddress,
            latitude: this.latitude,
            longitude: this.longitude,
            createdAt: this.createdAt.toString(),
            updatedAt: this.updatedAt.toString(),
        };
    }
}

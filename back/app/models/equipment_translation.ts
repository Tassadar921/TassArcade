import { BaseModel, column } from '@adonisjs/lucid/orm';
import { DateTime } from 'luxon';
import SerializedAddress from '#types/serialized/serialized_address';

export default class Equipment extends BaseModel {
    @column({ isPrimary: true })
    declare id: string;

    @column()
    declare frontId: number;

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime;

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime;

    get fullAddress(): string {
        return `${this.streetNumber} ${this.isBis ? 'Bis' : ''} ${this.street}, ${this.zipCode} ${this.city}, ${this.complement}, ${this.country}`;
    }

    get encodedAddress(): string {
        return encodeURIComponent(this.fullAddress);
    }

    public apiSerialize(): SerializedAddress {
        return {
            id: this.frontId,
            streetNumber: this.streetNumber,
            isBis: this.isBis,
            street: this.street,
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

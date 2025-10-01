import BaseRepository from '#repositories/base/base_repository';
import Address from '#models/address';
import db from '@adonisjs/lucid/services/db';

export default class AddressRepository extends BaseRepository<typeof Address> {
    constructor() {
        super(Address);
    }

    public async getClusters(minLat: number, maxLat: number, minLon: number, maxLon: number, precision: number): Promise<Address[]> {
        return db.rawQuery(
            `
            SELECT
              LEFT(geohash, ?) AS cluster,
              AVG(latitude) AS lat,
              AVG(longitude) AS lon,
              COUNT(*) AS count
            FROM addresses
            WHERE latitude BETWEEN ? AND ?
              AND longitude BETWEEN ? AND ?
            GROUP BY cluster
          `,
            [precision, minLat, maxLat, minLon, maxLon]
        );
    }
}

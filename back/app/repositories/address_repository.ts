import BaseRepository from '#repositories/base/base_repository';
import Address from '#models/address';
import db from '@adonisjs/lucid/services/db';

export default class AddressRepository extends BaseRepository<typeof Address> {
    constructor() {
        super(Address);
    }

    public async getClusters(minLat: number, maxLat: number, minLng: number, maxLng: number, precision: number): Promise<Address[]> {
        const result = await db.rawQuery(
            `
                SELECT
                    LEFT(geohash, ?) AS cluster,
                    AVG(latitude) AS lat,
                    AVG(longitude) AS lng,
                    COUNT(*) AS count,
                    CASE WHEN COUNT(*) > 1 THEN true ELSE false END AS "isCluster"
                    FROM addresses
                    WHERE latitude BETWEEN ? AND ?
                    AND longitude BETWEEN ? AND ?
                    GROUP BY cluster
            `,
            [precision, minLat, maxLat, minLng, maxLng]
        );

        return result.rows;
    }
}

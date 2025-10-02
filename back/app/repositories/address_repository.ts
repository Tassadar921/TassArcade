import BaseRepository from '#repositories/base/base_repository';
import Address from '#models/address';
import db from '@adonisjs/lucid/services/db';
import Company from '#models/company';
import SerializedCompany from '#types/serialized/serialized_company';

interface Cluster {
    id: string;
    lat: number;
    lng: number;
    companies: SerializedCompany[];
}

export default class AddressRepository extends BaseRepository<typeof Address> {
    constructor() {
        super(Address);
    }

    public async getClusters(minLat: number, maxLat: number, minLng: number, maxLng: number, precision: number): Promise<Cluster> {
        const result = await db.rawQuery(
            `
                SELECT
                    LEFT(geohash, ?) AS cluster,
                    AVG(latitude) AS lat,
                    AVG(longitude) AS lng,
                    array_agg(id) AS address_ids
                FROM addresses
                WHERE latitude BETWEEN ? AND ?
                  AND longitude BETWEEN ? AND ?
                GROUP BY cluster
            `,
            [precision, minLat, maxLat, minLng, maxLng]
        );

        console.log(result.rows[0]);

        const clusters: Cluster[] = [];

        for (const row of result.rows) {
            const companies: Company[] = await Company.query().preload('address').whereIn('address_id', row.address_ids);

            clusters.push({
                id: row.cluster,
                lat: row.lat,
                lng: row.lng,
                companies: companies.map((company: Company): SerializedCompany => company.apiSerialize()),
            });
        }

        return clusters;
    }
}

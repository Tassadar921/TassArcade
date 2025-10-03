import BaseRepository from '#repositories/base/base_repository';
import Company from '#models/company';
import Language from '#models/language';
import type { Cluster } from '#types/cluster';
import db from '@adonisjs/lucid/services/db';
import SerializedCompany from '#types/serialized/serialized_company';

export default class CompanyRepository extends BaseRepository<typeof Company> {
    constructor() {
        super(Company);
    }

    public async getClusters(minLat: number, maxLat: number, minLng: number, maxLng: number, precision: number, language: Language): Promise<Cluster[]> {
        const result = await db.rawQuery(
            `
                SELECT
                    LEFT(geohash, ?) AS cluster,
                    AVG(latitude) AS lat,
                    AVG(longitude) AS lng,
                    array_agg(id) AS address_ids,
                    COUNT(*) > 1 AS "isCluster"
                FROM addresses
                WHERE latitude BETWEEN ? AND ?
                  AND longitude BETWEEN ? AND ?
                GROUP BY cluster
            `,
            [precision, minLat, maxLat, minLng, maxLng]
        )

        const clusters: Cluster[] = [];

        for (const row of result.rows) {
            const companies: Company[] = await Company.query().preload('address').whereIn('address_id', row.address_ids).preload('equipments');

            clusters.push({
                id: row.cluster,
                lat: row.lat,
                lng: row.lng,
                isCluster: row.isCluster,
                companies: companies.map((company: Company): SerializedCompany => company.apiSerialize(language)),
            });
        }

        return clusters;
    }
}

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
                    LEFT(address.geohash, ?) AS cluster,
                    AVG(address.latitude) AS lat,
                    AVG(address.longitude) AS lng,
                    array_agg(DISTINCT address.id) AS address_ids,
                    COUNT(DISTINCT company.id) > 1 AS "isCluster"
                FROM addresses address
                    INNER JOIN companies company ON company.address_id = address.id
                    INNER JOIN company_equipment_types equipment_type ON equipment_type.company_id = company.id
                WHERE address.latitude BETWEEN ? AND ?
                  AND address.longitude BETWEEN ? AND ?
                GROUP BY cluster
            `,
            [precision, minLat, maxLat, minLng, maxLng]
        );

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

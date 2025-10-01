import Address from '#models/address';
import { HttpContext } from '@adonisjs/core/http';
import { getClustersValidator } from '#validators/cluster';
import { inject } from '@adonisjs/core';
import AddressRepository from '#repositories/address_repository';

@inject()
export default class ClusterController {
    constructor(private readonly addressRepository: AddressRepository) {}

    public async get({ request, response }: HttpContext) {
        const { minLat, maxLat, minLon, maxLon, zoom } = await request.validateUsing(getClustersValidator);

        let precision: number = 3;
        if (zoom >= 5 && zoom < 10) {
            precision = 5;
        } else if (zoom >= 10 && zoom < 13) {
            precision = 7;
        } else if (zoom >= 13) {
            precision = 9;
        }

        const clusters: Address[] = await this.addressRepository.getClusters(minLat, maxLat, minLon, maxLon, precision);
        console.log(clusters);

        return response.ok(clusters);
    }
}

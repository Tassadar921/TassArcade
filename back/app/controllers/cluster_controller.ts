import Address from '#models/address';
import { HttpContext } from '@adonisjs/core/http';
import { getClustersValidator } from '#validators/cluster';
import { inject } from '@adonisjs/core';
import AddressRepository from '#repositories/address_repository';

@inject()
export default class ClusterController {
    constructor(private readonly addressRepository: AddressRepository) {}

    public async get({ request, response }: HttpContext): Promise<void> {
        const { minLat, maxLat, minLng, maxLng, zoom } = await request.validateUsing(getClustersValidator);

        let precision: number = 2;
        if (zoom >= 2 && zoom < 4) {
            precision = 2;
        } else if (zoom >= 4 && zoom < 6) {
            precision = 3;
        } else if (zoom >= 6 && zoom < 8) {
            precision = 4;
        } else if (zoom >= 8 && zoom < 10) {
            precision = 5;
        } else if (zoom >= 10 && zoom < 12) {
            precision = 6;
        } else if (zoom >= 12 && zoom < 13) {
            precision = 7;
        } else if (zoom >= 13 && zoom < 16) {
            precision = 8;
        } else if (zoom >= 16) {
            precision = 9;
        }

        const clusters: Address[] = await this.addressRepository.getClusters(minLat, maxLat, minLng, maxLng, precision);

        return response.ok(clusters);
    }
}

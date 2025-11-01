import { HttpContext } from '@adonisjs/core/http';
import { inject } from '@adonisjs/core';
import CountryService from '#services/country_service';
import cache from '@adonisjs/cache/services/main';
import { Country } from 'country-list-with-dial-code-and-flag';

@inject()
export default class CountryController {
    constructor(private readonly countryService: CountryService) {}

    public async getAll({ response }: HttpContext): Promise<void> {
        return response.ok(
            await cache.getOrSet({
                key: 'countries',
                tags: ['countries'],
                ttl: '3h',
                factory: async (): Promise<Country[]> => {
                    return await this.countryService.getAll();
                },
            })
        );
    }
}

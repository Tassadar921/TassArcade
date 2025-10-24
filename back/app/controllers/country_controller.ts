import { HttpContext } from '@adonisjs/core/http';
import { inject } from '@adonisjs/core';
import CountryList, { Country } from 'country-list-with-dial-code-and-flag';

@inject()
export default class CountryController {
    public async getAll({ response }: HttpContext): Promise<void> {
        const countriesList: Country[] = CountryList.default.getAll();
        const seen: Set<string> = new Set<string>();
        const countriesListUnique: Country[] = [];

        for (const country of countriesList) {
            if (seen.has(country.code)) {
                continue;
            }

            seen.add(country.code);
            countriesListUnique.push(country);
        }

        return response.ok(countriesListUnique);
    }
}

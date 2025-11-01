import CountryList, { Country } from 'country-list-with-dial-code-and-flag';

export default class CountryService {
    public async getAll(): Promise<Country[]> {
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

        return countriesListUnique;
    }
}

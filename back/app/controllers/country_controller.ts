import { HttpContext } from '@adonisjs/core/http';
import { inject } from '@adonisjs/core';
import CountryList from 'country-list-with-dial-code-and-flag';

@inject()
export default class CountryController {
    public async getAll({ response }: HttpContext): Promise<void> {
        return response.ok(CountryList.default.getAll());
    }
}

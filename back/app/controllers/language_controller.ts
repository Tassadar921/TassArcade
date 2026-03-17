import { HttpContext } from '@adonisjs/core/http';
import { inject } from '@adonisjs/core';
import LanguageRepository from '#repositories/language_repository';
import Language from '#models/language';
import SerializedLanguage from '#types/serialized/serialized_language';
import cache from '@adonisjs/cache/services/main';

@inject()
export default class LanguageController {
    constructor(private readonly languageRepository: LanguageRepository) {}

    public async getAll({ response }: HttpContext) {
        await cache.deleteByTag({ tags: ['languages'] });
        return response.ok(
            await cache.getOrSet({
                key: 'languages',
                tags: ['languages'],
                ttl: '24h',
                factory: async (): Promise<SerializedLanguage[]> => {
                    const languages: Language[] = await this.languageRepository.all(['flag']);

                    return languages.map((language: Language): SerializedLanguage => language.apiSerialize());
                },
            })
        );
    }
}

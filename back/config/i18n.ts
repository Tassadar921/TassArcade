import app from '@adonisjs/core/services/app';
import { defineConfig, formatters, loaders } from '@adonisjs/i18n';
import Language from '#models/language';

export const supportedLocales = ['en', 'fr'] as const;
export type SupportedLocale = (typeof supportedLocales)[number];

const i18nConfig = defineConfig({
    defaultLocale: Language.LANGUAGE_ENGLISH.code,
    supportedLocales: [...supportedLocales],
    formatter: formatters.icu(),
    loaders: [
        loaders.fs({
            location: app.languageFilesPath(),
        }),
    ],
});

export default i18nConfig;

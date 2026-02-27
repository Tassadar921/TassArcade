import { DateTime } from 'luxon';
import { afterCreate, afterUpdate, BaseModel, belongsTo, column } from '@adonisjs/lucid/orm';
import File from '#models/file';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';
import SerializedLanguage from '#types/serialized/serialized_language';
import type { SupportedLocale } from '#config/i18n';

interface LanguageInterface {
    name: string;
    code: string;
    isFallback?: boolean;
}

export default class Language extends BaseModel {
    public static table: string = 'languages';

    public static LANGUAGE_ENGLISH: LanguageInterface = {
        name: 'English',
        code: 'en',
        isFallback: true,
    };

    public static LANGUAGE_FRENCH: LanguageInterface = {
        name: 'Français',
        code: 'fr',
    };

    @column({ isPrimary: true })
    declare id: string;

    @column()
    declare name: string;

    @column()
    declare code: SupportedLocale;

    @column()
    declare isFallback: boolean;

    @column()
    declare flagId: string | null;

    @belongsTo((): typeof File => File, {
        foreignKey: 'flagId',
    })
    declare flag: BelongsTo<typeof File>;

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime;

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime;

    @afterCreate()
    @afterUpdate()
    public static async refresh(language: Language): Promise<void> {
        await language.refresh();
    }

    public apiSerialize(): SerializedLanguage {
        return {
            name: this.name,
            code: this.code,
            flag: this.flag.apiSerialize(),
        };
    }
}

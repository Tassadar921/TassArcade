import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';
import cache from '@adonisjs/cache/services/main';
import StringService from '#services/string_service';
import { createOrUpdateEquipmentTypeValidator, deleteEquipmentTypesValidator, getAdminEquipmentTypeValidator, searchAdminEquipmentTypesValidator } from '#validators/admin/equipment_type';
import EquipmentTypeRepository from '#repositories/equipment_type_repository';
import PaginatedEquipmentTypes from '#types/paginated/paginated_equipment_types';
import EquipmentType from '#models/equipment_type';
import Equipment from '#models/equipment';
import { DeleteEquipmentTypeResult } from '#types/delete_equipment_type_result';
import SerializedLanguage from '#types/serialized/serialized_language';
import Language from '#models/language';
import LanguageRepository from '#repositories/language_repository';
import EquipmentTypeTranslation from '#models/equipment_type_translation';
import type { SupportedLocale } from '#config/i18n';
import EquipmentTypeTranslationRepository from '#repositories/equipment_type_translation_repository';
import SerializedEquipmentTypeTranslation from '#types/serialized/serialized_equipment_type_translation';
import SerializedEquipmentTypeExtended from '#types/serialized/serialized_equipment_type_extended';
import EquipmentRepository from '#repositories/equipment_repository';

@inject()
export default class AdminEquipmentTypeController {
    constructor(
        private readonly equipmentTypeRepository: EquipmentTypeRepository,
        private readonly stringService: StringService,
        private readonly languageRepository: LanguageRepository,
        private readonly equipmentTypeTranslationRepository: EquipmentTypeTranslationRepository,
        private readonly equipmentRepository: EquipmentRepository
    ) {}

    public async getAll({ request, response, language }: HttpContext) {
        const { query, page, limit, sortBy: inputSortBy } = await request.validateUsing(searchAdminEquipmentTypesValidator);

        return response.ok(
            await cache.getOrSet({
                key: `equipment-types:query:${query}:page:${page}:limit:${limit}:sortBy:${inputSortBy}`,
                tags: ['admin-equipment-types'],
                ttl: '24h',
                factory: async (): Promise<PaginatedEquipmentTypes> => {
                    const [field, order] = inputSortBy.split(':');
                    const sortBy = {
                        field: this.stringService.toSnakeCase(field) as `equipments.${keyof Equipment['$attributes']}` | `equipment_types.${keyof EquipmentType['$attributes']}`,
                        order: order as 'asc' | 'desc',
                    };

                    return await this.equipmentTypeRepository.getEquipmentTypes(language, query, page, limit, sortBy);
                },
            })
        );
    }

    public async delete({ request, response, i18n, language }: HttpContext) {
        const { equipmentTypes } = await request.validateUsing(deleteEquipmentTypesValidator);
        const statuses: DeleteEquipmentTypeResult[] = await this.equipmentTypeRepository.delete(equipmentTypes, language);

        return response.ok({
            messages: await Promise.all(
                statuses.map(async (status: DeleteEquipmentTypeResult): Promise<{ id: string; message: string; isSuccess: boolean }> => {
                    if (status.isDeleted) {
                        await cache.deleteByTag({ tags: ['admin-equipment-types', `admin-equipment-type:${status.id}`, 'equipments'] });
                        return { id: status.id, message: i18n.t(`messages.admin.equipment-type.delete.success`, { name: status.name }), isSuccess: true };
                    } else {
                        return { id: status.id, message: i18n.t(`messages.admin.equipment-type.delete.error.default`, { id: status.id }), isSuccess: false };
                    }
                })
            ),
        });
    }

    public async create({ request, response, i18n, language }: HttpContext) {
        const rawTranslations = request.input('translations');

        if (typeof rawTranslations === 'string') {
            try {
                request.updateBody({
                    ...request.all(),
                    translations: JSON.parse(rawTranslations),
                });
            } catch {
                return response.badRequest({ message: 'Invalid translations JSON' });
            }
        }

        const { code, equipmentId, translations } = await request.validateUsing(createOrUpdateEquipmentTypeValidator);

        const equipment: Equipment | null = await this.equipmentRepository.findOneBy({ id: equipmentId });
        if (!equipment) {
            return response.notFound({ error: i18n.t('messages.admin.equipment-type.create.error.equipment-not-found') });
        }

        let equipmentType: EquipmentType | null = await this.equipmentTypeRepository.findOneBy({ code });
        if (equipmentType) {
            return response.badRequest({ error: i18n.t('messages.admin.equipment-type.create.error.already-exists', { code }) });
        }

        equipmentType = await EquipmentType.create({
            code,
            equipmentId,
        });

        await Promise.all(
            translations.map(async (translation) => {
                const language: Language = await this.languageRepository.firstOrFail({ code: translation.code as SupportedLocale });

                await EquipmentTypeTranslation.create({
                    name: translation.name,
                    languageId: language.id,
                    equipmentTypeId: equipmentType!.id,
                });
            })
        );

        equipmentType = await this.equipmentTypeRepository.loadForSerialization(equipmentType, language);

        await cache.deleteByTag({ tags: ['admin-equipment-types'] });

        return response.created({
            equipmentType: equipmentType.apiSerializeExtended(),
            message: i18n.t('messages.admin.equipment-type.create.success', { name: translations.find((translation) => translation.code === language.code)?.name }),
        });
    }

    public async update({ request, response, i18n, language: currentLanguage }: HttpContext) {
        const rawTranslations = request.input('translations');

        if (typeof rawTranslations === 'string') {
            try {
                request.updateBody({
                    ...request.all(),
                    translations: JSON.parse(rawTranslations),
                });
            } catch {
                return response.badRequest({ message: 'Invalid translations JSON' });
            }
        }

        const { code, equipmentId, translations } = await request.validateUsing(createOrUpdateEquipmentTypeValidator);

        const equipment: Equipment | null = await this.equipmentRepository.findOneBy({ id: equipmentId });
        if (!equipment) {
            return response.notFound({ error: i18n.t('messages.admin.equipment-type.update.error.equipment-not-found') });
        }

        const equipmentType: EquipmentType | null = await this.equipmentTypeRepository.getOneByCode(code, currentLanguage);
        if (!equipmentType) {
            return response.notFound({ error: i18n.t('messages.admin.equipment-type.get.error.not-found') });
        }

        equipmentType.equipmentId = equipmentId;
        await equipmentType.save();

        let currentEquipmentTypeTranslation: EquipmentTypeTranslation | undefined;

        await Promise.all([
            cache.deleteByTag({ tags: ['admin-equipment-types', `admin-equipment-type:${equipmentType.id}`] }),
            translations.map(async (translation): Promise<void> => {
                try {
                    let equipmentTypeTranslation: EquipmentTypeTranslation | null = await this.equipmentTypeTranslationRepository.getFromEquipmentTypeAndLanguageCode(
                        equipmentType,
                        translation.code as SupportedLocale
                    );

                    if (!equipmentTypeTranslation) {
                        const language: Language = await this.languageRepository.firstOrFail({ code: translation.code as SupportedLocale });
                        equipmentTypeTranslation = await EquipmentTypeTranslation.create({
                            name: translation.name,
                            equipmentTypeId: equipmentType.id,
                            languageId: language.id,
                        });
                    } else {
                        equipmentTypeTranslation.name = translation.name;
                        await equipmentTypeTranslation.save();
                    }

                    if (translation.code === currentLanguage.code) {
                        currentEquipmentTypeTranslation = equipmentTypeTranslation;
                    }
                } catch (error) {
                    throw error;
                }
            }),
        ]);

        return response.ok({
            equipmentType: equipmentType.apiSerializeExtended(),
            message: i18n.t('messages.admin.equipment-type.update.success', { name: currentEquipmentTypeTranslation?.name || '' }),
        });
    }

    public async get({ request, response, i18n, language }: HttpContext) {
        const { id } = await getAdminEquipmentTypeValidator.validate(request.params());

        await cache.deleteByTag({ tags: ['admin-equipment-types', `admin-equipment-type:${id}`] });

        const equipmentType: EquipmentType | null = await this.equipmentTypeRepository.getOneById(id, language);
        if (!equipmentType) {
            return response.notFound({ error: i18n.t('messages.admin.equipment-type.get.error.not-found') });
        }

        return response.ok({
            equipmentType: await cache.getOrSet({
                key: `admin-equipment-type:${equipmentType.id}`,
                tags: [`admin-equipment-type:${equipmentType.id}`],
                ttl: '1h',
                factory: (): SerializedEquipmentTypeExtended => {
                    return equipmentType.apiSerializeExtended();
                },
            }),
            equipmentTypeTranslations: await cache.getOrSet({
                key: `admin-equipment-type-translations:${equipmentType.id}`,
                tags: [`admin-equipment-type:${equipmentType.id}`],
                ttl: '1h',
                factory: async (): Promise<SerializedEquipmentTypeTranslation[]> => {
                    const equipmentTypeTranslations: EquipmentTypeTranslation[] = await this.equipmentTypeTranslationRepository.getAllFromEquipmentType(equipmentType);

                    return await Promise.all(
                        equipmentTypeTranslations.map((equipmentTypeTranslation: EquipmentTypeTranslation): SerializedEquipmentTypeTranslation => equipmentTypeTranslation.apiSerialize())
                    );
                },
            }),
            languages: await cache.getOrSet({
                key: 'languages',
                tags: ['languages'],
                ttl: '24h',
                factory: async (): Promise<SerializedLanguage[]> => {
                    const languages: Language[] = await this.languageRepository.all(['flag']);

                    return languages.map((language: Language): SerializedLanguage => language.apiSerialize());
                },
            }),
        });
    }
}

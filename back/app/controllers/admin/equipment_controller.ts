import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';
import cache from '@adonisjs/cache/services/main';
import app from '@adonisjs/core/services/app';
import File from '#models/file';
import path from 'node:path';
import FileTypeEnum from '#types/enum/file_type_enum';
import FileService from '#services/file_service';
import { MultipartFile } from '@adonisjs/bodyparser/types';
import SlugifyService from '#services/slugify_service';
import StringService from '#services/string_service';
import { createOrUpdateEquipmentValidator, deleteEquipmentsValidator, getAdminEquipmentValidator, searchAdminEquipmentsValidator } from '#validators/admin/equipment';
import EquipmentRepository from '#repositories/equipment_repository';
import PaginatedEquipments from '#types/paginated/paginated_equipments';
import Equipment from '#models/equipment';
import { DeleteEquipmentResult } from '#types/delete_equipment_result';
import SerializedLanguage from '#types/serialized/serialized_language';
import Language from '#models/language';
import LanguageRepository from '#repositories/language_repository';
import EquipmentTranslation from '#models/equipment_translation';
import type { SupportedLocale } from '#config/i18n';
import EquipmentTranslationRepository from '#repositories/equipment_translation_repository';
import SerializedEquipmentTranslation from '#types/serialized/serialized_equipment_translation';
import SerializedEquipmentLight from '#types/serialized/serialized_equipment_light';

@inject()
export default class AdminEquipmentController {
    constructor(
        private readonly equipmentRepository: EquipmentRepository,
        private readonly fileService: FileService,
        private readonly slugifyService: SlugifyService,
        private readonly stringService: StringService,
        private readonly languageRepository: LanguageRepository,
        private readonly equipmentTranslationRepository: EquipmentTranslationRepository
    ) {}

    public async getAll({ request, response, language }: HttpContext) {
        const { query, page, limit, sortBy: inputSortBy } = await request.validateUsing(searchAdminEquipmentsValidator);

        return response.ok(
            await cache.getOrSet({
                key: `equipments:query:${query}:page:${page}:limit:${limit}:sortBy:${inputSortBy}`,
                tags: ['equipments'],
                ttl: '24h',
                factory: async (): Promise<PaginatedEquipments> => {
                    const [field, order] = inputSortBy.split(':');
                    const sortBy = {
                        field: this.stringService.toSnakeCase(field) as `equipments.${keyof Equipment['$attributes']}` | `equipment_translations.${keyof EquipmentTranslation['$attributes']}`,
                        order: order as 'asc' | 'desc',
                    };

                    return await this.equipmentRepository.getEquipments(language, query, page, limit, sortBy);
                },
            })
        );
    }

    public async delete({ request, response, i18n, language }: HttpContext) {
        const { equipments } = await request.validateUsing(deleteEquipmentsValidator);
        const statuses: DeleteEquipmentResult[] = await this.equipmentRepository.delete(equipments, language);

        return response.ok({
            messages: await Promise.all(
                statuses.map(async (status: DeleteEquipmentResult): Promise<{ id: string; message: string; isSuccess: boolean }> => {
                    if (status.isDeleted) {
                        await cache.deleteByTag({ tags: ['equipments', `equipment:${status.id}`, 'equipment-types'] });
                        return { id: status.id, message: i18n.t(`messages.admin.equipment.delete.success`, { name: status.name }), isSuccess: true };
                    } else {
                        return { id: status.id, message: i18n.t(`messages.admin.equipment.delete.error.default`, { id: status.id }), isSuccess: false };
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

        const { category, translations, thumbnail: inputThumbnail } = await request.validateUsing(createOrUpdateEquipmentValidator);

        let equipment: Equipment | null = await this.equipmentRepository.findOneBy({ category });
        if (equipment) {
            return response.badRequest({ error: i18n.t('messages.admin.equipment.create.error.already-exists', { category }) });
        }

        const thumbnail: File = await this.processInputThumbnail(inputThumbnail);

        equipment = await Equipment.create({
            category,
            thumbnailId: thumbnail.id,
        });

        await Promise.all(
            translations.map(async (translation) => {
                const language: Language = await this.languageRepository.firstOrFail({ code: translation.languageCode as SupportedLocale });

                await EquipmentTranslation.create({
                    name: translation.name,
                    languageId: language.id,
                    equipmentId: equipment!.id,
                });
            })
        );

        equipment = await this.equipmentRepository.loadForSerialization(equipment, language);

        await Promise.all([equipment.load('thumbnail'), cache.deleteByTag({ tags: ['equipments'] })]);

        return response.created({
            equipment: equipment.apiSerializeLight(),
            message: i18n.t('messages.admin.equipment.create.success', { name: translations.find((translation) => translation.languageCode === language.code)?.name }),
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

        const { category, translations, thumbnail: inputThumbnail } = await request.validateUsing(createOrUpdateEquipmentValidator);

        const equipment: Equipment | null = await this.equipmentRepository.getOneByCategory(category, currentLanguage);
        if (!equipment) {
            return response.notFound({ error: i18n.t('messages.admin.equipment.get.error.not-found') });
        }

        if (!this.areSameFiles(equipment.thumbnail, inputThumbnail)) {
            this.fileService.delete(equipment.thumbnail);

            const thumbnail: File = await this.processInputThumbnail(inputThumbnail);
            equipment.thumbnailId = thumbnail.id;

            await equipment.save();
            await equipment.thumbnail.delete();
            await equipment.load('thumbnail');
        }

        let currentEquipmentTranslation: EquipmentTranslation | undefined;

        await Promise.all([
            cache.deleteByTag({ tags: ['equipments', `equipment:${equipment.id}`] }),
            translations.map(async (translation): Promise<void> => {
                try {
                    let equipmentTranslation: EquipmentTranslation | null = await this.equipmentTranslationRepository.getFromEquipmentAndLanguageCode(
                        equipment,
                        translation.languageCode as SupportedLocale
                    );

                    if (!equipmentTranslation) {
                        const language: Language = await this.languageRepository.firstOrFail({ code: translation.languageCode as SupportedLocale });
                        equipmentTranslation = await EquipmentTranslation.create({
                            name: translation.name,
                            equipmentId: equipment.id,
                            languageId: language.id,
                        });
                    } else {
                        equipmentTranslation.name = translation.name;
                        await equipmentTranslation.save();
                    }

                    if (translation.languageCode === currentLanguage.code) {
                        currentEquipmentTranslation = equipmentTranslation;
                    }
                } catch (error) {
                    throw error;
                }
            }),
        ]);

        return response.ok({ equipment: equipment.apiSerializeLight(), message: i18n.t('messages.admin.equipment.update.success', { name: currentEquipmentTranslation?.name || '' }) });
    }

    public async get({ request, response, i18n, language }: HttpContext) {
        const { id } = await getAdminEquipmentValidator.validate(request.params());

        const equipment: Equipment | null = await this.equipmentRepository.getOneById(id, language);
        if (!equipment) {
            return response.notFound({ error: i18n.t('messages.admin.equipment.get.error.not-found') });
        }

        return response.ok({
            equipment: await cache.getOrSet({
                key: `admin-equipment:${equipment.id}`,
                tags: [`equipment:${equipment.id}`],
                ttl: '1h',
                factory: (): SerializedEquipmentLight => {
                    return equipment.apiSerializeLight();
                },
            }),
            equipmentTranslations: await cache.getOrSet({
                key: `admin-equipment-translations:${equipment.id}`,
                tags: [`equipment:${equipment.id}`],
                ttl: '1h',
                factory: async (): Promise<SerializedEquipmentTranslation[]> => {
                    const equipmentTranslations: EquipmentTranslation[] = await this.equipmentTranslationRepository.getAllFromEquipment(equipment);

                    return await Promise.all(equipmentTranslations.map((equipmentTranslation: EquipmentTranslation): SerializedEquipmentTranslation => equipmentTranslation.apiSerialize()));
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

    private async processInputThumbnail(inputThumbnail: MultipartFile): Promise<File> {
        try {
            const originalName: string = inputThumbnail.clientName;
            const slugifiedName: string = this.slugifyService.slugify(originalName);
            const uniqueFilename: string = `${slugifiedName.replace('.svg', '')}-${Date.now()}.svg`;

            const thumbnailPath: string = 'static/equipment-thumbnail';
            const fullPath: string = app.makePath(thumbnailPath);

            await inputThumbnail.move(fullPath, { name: uniqueFilename });

            return await File.create({
                name: uniqueFilename,
                path: `${thumbnailPath}/${uniqueFilename}`,
                extension: path.extname(originalName),
                mimeType: inputThumbnail.headers['content-type'],
                size: inputThumbnail.size,
                type: FileTypeEnum.EQUIPMENT_THUMBNAIL,
            });
        } catch (error) {
            throw error;
        }
    }

    private areSameFiles(file: File, multipartFile: MultipartFile): boolean {
        return file.extension === path.extname(multipartFile.clientName) && file.mimeType === multipartFile.headers['content-type'] && file.size === multipartFile.size;
    }
}

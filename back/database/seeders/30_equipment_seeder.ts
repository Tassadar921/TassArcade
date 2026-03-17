import { BaseSeeder } from '@adonisjs/lucid/seeders';
import path from 'path';
import fsPromises from 'fs/promises';
import app from '@adonisjs/core/services/app';
import FileService from '#services/file_service';
import File from '#models/file';
import FileTypeEnum from '#types/enum/file_type_enum';
import FileRepository from '#repositories/file_repository';
import EquipmentRepository from '#repositories/equipment_repository';
import Equipment from '#models/equipment';
import EquipmentType from '#models/equipment_type';
import Language from '#models/language';
import LanguageRepository from '#repositories/language_repository';
import EquipmentTranslation from '#models/equipment_translation';
import EquipmentTypeTranslation from '#models/equipment_type_translation';

interface LocalEquipment {
    category: string;
    translations: {
        fr: string;
        en: string;
    };
    types: {
        code: string;
        translations: {
            fr: string;
            en: string;
        };
    }[];
}

export default class extends BaseSeeder {
    private readonly fileService: FileService = new FileService();
    private readonly equipmentRepository: EquipmentRepository = new EquipmentRepository();
    private readonly fileRepository: FileRepository = new FileRepository();
    private readonly languageRepository: LanguageRepository = new LanguageRepository();

    public async run(): Promise<void> {
        const equipments: LocalEquipment[] = [
            {
                category: 'dart',
                translations: {
                    fr: 'Fléchettes',
                    en: 'Dart',
                },
                types: [
                    {
                        code: 'steel',
                        translations: {
                            fr: 'Fléchettes',
                            en: 'Steel darts',
                        },
                    },
                    {
                        code: 'soft',
                        translations: {
                            fr: 'Fléchettes électroniques',
                            en: 'Soft darts',
                        },
                    },
                ],
            },
            {
                category: 'pool',
                translations: {
                    fr: 'Billard',
                    en: 'Pool',
                },
                types: [
                    {
                        code: 'pool',
                        translations: {
                            fr: 'Billard américain (Pool)',
                            en: 'Pool',
                        },
                    },
                    {
                        code: 'snooker',
                        translations: {
                            fr: 'Snooker',
                            en: 'Snooker',
                        },
                    },
                    {
                        code: 'carom',
                        translations: {
                            fr: 'Billard français (Carambole)',
                            en: 'Carom billiards',
                        },
                    },
                    {
                        code: 'russian',
                        translations: {
                            fr: 'Billard russe (Russian Pyramid)',
                            en: 'Russian pyramid',
                        },
                    },
                    {
                        code: 'artistic',
                        translations: {
                            fr: 'Billard artistique (Artistic billiards)',
                            en: 'Artistic billiards',
                        },
                    },
                ],
            },
            {
                category: 'bowling',
                translations: {
                    fr: 'Bowling',
                    en: 'Bowling',
                },
                types: [
                    {
                        code: 'ten-pin',
                        translations: {
                            fr: 'Bowling classique / standard',
                            en: 'Ten-pin bowling',
                        },
                    },
                    {
                        code: 'five-pin',
                        translations: {
                            fr: 'Bowling à 5 quilles',
                            en: 'Five-pin bowling',
                        },
                    },
                    {
                        code: 'nine-pin',
                        translations: {
                            fr: 'Bowling à 9 quilles',
                            en: 'Nine-pin bowling',
                        },
                    },
                    {
                        code: 'candlepin',
                        translations: {
                            fr: 'Bowling à boules fixes (Candlepin)',
                            en: 'Candlepin bowling',
                        },
                    },
                    {
                        code: 'duckpin',
                        translations: {
                            fr: 'Bowling à quilles américaines (Duckpin)',
                            en: 'Duckpin bowling',
                        },
                    },
                ],
            },
        ];

        const english: Language = await this.languageRepository.firstOrFail({ code: 'en' });
        const french: Language = await this.languageRepository.firstOrFail({ code: 'fr' });

        for (const equipmentData of equipments) {
            let thumbnail: File | null = await this.fileRepository.findOneBy({ name: `${equipmentData.category}.svg`, type: FileTypeEnum.EQUIPMENT_THUMBNAIL });
            if (!thumbnail) {
                const path: string = await this.moveEquipmentPicture(equipmentData.category);
                const { size, mimeType, extension, name } = await this.fileService.getFileInfo(app.makePath(`${path}/${equipmentData.category}.svg`));
                thumbnail = await File.create({
                    name,
                    path: `${path}/${equipmentData.category}.svg`,
                    extension,
                    mimeType,
                    size,
                    type: FileTypeEnum.EQUIPMENT_THUMBNAIL,
                });
                await thumbnail.refresh();
            }

            // Assume that if it exists, all of its types & related translations also exist
            if (!(await this.equipmentRepository.findOneBy({ category: equipmentData.category }))) {
                const equipment: Equipment = await Equipment.firstOrCreate({
                    category: equipmentData.category,
                    thumbnailId: thumbnail.id,
                });
                await equipment.refresh();

                await EquipmentTranslation.firstOrCreate({
                    name: equipmentData.translations.en,
                    languageId: english.id,
                    equipmentId: equipment.id,
                });

                await EquipmentTranslation.firstOrCreate({
                    name: equipmentData.translations.fr,
                    languageId: french.id,
                    equipmentId: equipment.id,
                });

                for (const type of equipmentData.types) {
                    const equipmentType: EquipmentType = await EquipmentType.firstOrCreate({
                        code: type.code,
                        equipmentId: equipment.id,
                    });
                    await equipmentType.refresh();

                    await EquipmentTypeTranslation.firstOrCreate({
                        name: type.translations.en,
                        languageId: english.id,
                        equipmentTypeId: equipmentType.id,
                    });

                    await EquipmentTypeTranslation.firstOrCreate({
                        name: type.translations.fr,
                        languageId: french.id,
                        equipmentTypeId: equipmentType.id,
                    });
                }
            }
        }
    }

    private async moveEquipmentPicture(category: string): Promise<string> {
        const targetDir: string = path.join(process.cwd(), 'static/equipment-thumbnail');
        const targetFile: string = path.join(targetDir, `${category}.svg`);

        try {
            await fsPromises.mkdir(targetDir, { recursive: true });

            try {
                await fsPromises.access(targetFile);
            } catch {
                await fsPromises.copyFile(path.join(process.cwd(), `database/seeders/equipment/${category}.svg`), targetFile);
                console.log(`Copied ${category}.svg`);
            }
        } catch (error: any) {
            console.error(`An error occurred while copying ${category}.svg :`, error);
        }

        return targetDir;
    }
}

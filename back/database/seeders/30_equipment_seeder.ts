import { BaseSeeder } from '@adonisjs/lucid/seeders';
import Language from '#models/language';
import LanguageRepository from '#repositories/language_repository';
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
import EquipmentTranslation from '#models/equipment_translation';
import EquipmentTypeTranslation from '#models/equipment_type_translation';

interface LocalEquipment {
    category: string;
    fr: string;
    en: string;
    types: {
        code: string;
        fr: string;
        en: string;
    }[];
}

export default class extends BaseSeeder {
    public async run(): Promise<void> {
        const fileService: FileService = new FileService();
        const languageRepository: LanguageRepository = new LanguageRepository(fileService);
        const equipmentRepository: EquipmentRepository = new EquipmentRepository();
        const fileRepository: FileRepository = new FileRepository();

        const equipments: LocalEquipment[] = [
            {
                category: 'dart',
                fr: 'Fléchettes',
                en: 'Dart',
                types: [
                    {
                        code: 'steel',
                        fr: 'Fléchettes',
                        en: 'Steel darts',
                    },
                    {
                        code: 'soft',
                        fr: 'Fléchettes électroniques',
                        en: 'Soft darts',
                    },
                ],
            },
            {
                category: 'pool',
                fr: 'Billard',
                en: 'Pool',
                types: [
                    {
                        code: 'pool',
                        fr: 'Billard américain (Pool)',
                        en: 'Pool',
                    },
                    {
                        code: 'snooker',
                        fr: 'Snooker',
                        en: 'Snooker',
                    },
                    {
                        code: 'carom',
                        fr: 'Billard français (Carambole)',
                        en: 'Carom billiards',
                    },
                    {
                        code: 'russian',
                        fr: 'Billard russe (Russian Pyramid)',
                        en: 'Russian pyramid',
                    },
                    {
                        code: 'artistic',
                        fr: 'Billard artistique (Artistic billiards)',
                        en: 'Artistic billiards',
                    },
                ],
            },
            {
                category: 'bowling',
                fr: 'Bowling',
                en: 'Bowling',
                types: [
                    {
                        code: 'ten-pin',
                        fr: 'Bowling classique / standard',
                        en: 'Ten-pin bowling',
                    },
                    {
                        code: 'five-pin',
                        fr: 'Bowling à 5 quilles',
                        en: 'Five-pin bowling',
                    },
                    {
                        code: 'nine-pin',
                        fr: 'Bowling à 9 quilles',
                        en: 'Nine-pin bowling',
                    },
                    {
                        code: 'candlepin',
                        fr: 'Bowling à boules fixes (Candlepin)',
                        en: 'Candlepin bowling',
                    },
                    {
                        code: 'duckpin',
                        fr: 'Bowling à quilles américaines (Duckpin)',
                        en: 'Duckpin bowling',
                    },
                ],
            },
        ];

        const french: Language = await languageRepository.firstOrFail({ code: Language.LANGUAGE_FRENCH.code });
        const english: Language = await languageRepository.firstOrFail({ code: Language.LANGUAGE_ENGLISH.code });

        for (const equipmentData of equipments) {
            let picture: File | null = await fileRepository.findOneBy({ name: `${equipmentData.category}.svg`, type: FileTypeEnum.EQUIPMENT_PICTURE });
            if (!picture) {
                const path: string = await this.moveEquipmentPicture(equipmentData.category);
                const { size, mimeType, extension, name } = await fileService.getFileInfo(app.makePath(`${path}/${equipmentData.category}.svg`));
                picture = await File.create({
                    name,
                    path: `${path}/${equipmentData.category}.svg`,
                    extension,
                    mimeType,
                    size,
                    type: FileTypeEnum.EQUIPMENT_PICTURE,
                });
                await picture.refresh();
            }

            // Assume that if it exists, all of its types & related translations also exist
            if (!(await equipmentRepository.findOneBy({ category: equipmentData.category }))) {
                const equipment: Equipment = await Equipment.create({
                    category: equipmentData.category,
                    pictureId: picture.id,
                });

                for (const language of [english, french]) {
                    await EquipmentTranslation.create({
                        equipmentId: equipment.id,
                        languageId: language.id,
                        name: equipmentData[language.code as 'fr' | 'en'],
                    });
                }

                for (const type of equipmentData.types) {
                    const equipmentType: EquipmentType = await EquipmentType.create({
                        code: type.code,
                        equipmentId: equipment.id,
                    });
                    await equipmentType.refresh();

                    for (const language of [english, french]) {
                        await EquipmentTypeTranslation.create({
                            equipmentTypeId: equipment.id,
                            languageId: language.id,
                            name: type[language.code as 'fr' | 'en'],
                        });
                    }
                }
            }
        }
    }

    private async moveEquipmentPicture(category: string): Promise<string> {
        const targetDir: string = path.join(process.cwd(), 'static/equipment-picture');
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

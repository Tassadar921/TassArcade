import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';
import app from '@adonisjs/core/services/app';
import UserRepository from '#repositories/user_repository';
import User from '#models/user';
import { serveStaticProfilePictureFileValidator, serveStaticEquipmentThumbnailFileValidator, serveStaticCompanyLogoFileValidator } from '#validators/file';
import cache from '@adonisjs/cache/services/main';
import EquipmentRepository from '#repositories/equipment_repository';
import Equipment from '#models/equipment';
import CompanyRepository from '#repositories/company_repository';
import Company from '#models/company';

@inject()
export default class FileController {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly equipmentRepository: EquipmentRepository,
        private readonly companyRepository: CompanyRepository
    ) {}

    public async serveStaticProfilePictureFile({ request, response, i18n }: HttpContext): Promise<void> {
        const { userId } = await serveStaticProfilePictureFileValidator.validate(request.params());

        try {
            const filePath: string = await cache.getOrSet({
                key: `user-profile-picture:${userId}`,
                tags: [`user:${userId}`],
                ttl: '1h',
                factory: async (): Promise<string> => {
                    const user: User = await this.userRepository.firstOrFail({ id: userId });
                    if (!user.profilePicture) {
                        throw new Error('NO_FILE');
                    }

                    return app.makePath(user.profilePicture.path);
                },
            });

            return response.download(filePath);
        } catch (error: any) {
            if (error.message === 'NO_FILE') {
                return response.notFound({ error: i18n.t('messages.file.serve-profile-picture.error.no-file') });
            } else {
                return response.notFound({ error: i18n.t('messages.file.serve-profile-picture.error.user-not-found') });
            }
        }
    }

    public async serveStaticEquipmentThumbnailFile({ request, response, i18n }: HttpContext): Promise<void> {
        const { equipmentId } = await serveStaticEquipmentThumbnailFileValidator.validate(request.params());

        try {
            const filePath: string = await cache.getOrSet({
                key: `equipment-thumbnail:${equipmentId}`,
                tags: [`equipment-thumbnail:${equipmentId}`],
                ttl: '1h',
                factory: async (): Promise<string> => {
                    const equipment: Equipment = await this.equipmentRepository.firstOrFail({ id: equipmentId });
                    if (!equipment.thumbnail) {
                        throw new Error('NO_FILE');
                    }

                    return app.makePath(equipment.thumbnail.path);
                },
            });

            return response.download(filePath);
        } catch (error: any) {
            if (error.message === 'NO_FILE') {
                return response.notFound({ error: i18n.t('messages.file.serve-equipment-thumbnail.error.no-file') });
            } else {
                return response.notFound({ error: i18n.t('messages.file.serve-equipment-thumbnail.error.equipment-not-found') });
            }
        }
    }

    public async serveStaticCompanyLogoFile({ request, response, i18n }: HttpContext): Promise<void> {
        const { companyId } = await serveStaticCompanyLogoFileValidator.validate(request.params());

        try {
            const filePath: string = await cache.getOrSet({
                key: `company-logo:${companyId}`,
                tags: [`company-logo:${companyId}`],
                ttl: '1h',
                factory: async (): Promise<string> => {
                    const company: Company = await this.companyRepository.firstOrFail({ id: companyId });
                    if (!company.logo) {
                        throw new Error('NO_FILE');
                    }

                    return app.makePath(company.logo.path);
                },
            });

            return response.download(filePath);
        } catch (error: any) {
            if (error.message === 'NO_FILE') {
                return response.notFound({ error: i18n.t('messages.file.serve-company-logo.error.no-file') });
            } else {
                return response.notFound({ error: i18n.t('messages.file.serve-company-logo.error.logo-not-found') });
            }
        }
    }
}

import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';
import cache from '@adonisjs/cache/services/main';
import app from '@adonisjs/core/services/app';
import File from '#models/file';
import path from 'node:path';
import FileTypeEnum from '#types/enum/file_type_enum';
import FileService from '#services/file_service';
import { MultipartFile } from '@adonisjs/bodyparser/types';
import UserRepository from '#repositories/user_repository';
import { createUserValidator, deleteUsersValidator, getAdminUserValidator, searchAdminUsersValidator, updateUserValidator } from '#validators/admin/user';
import User from '#models/user';
import { cuid } from '@adonisjs/core/helpers';
import SlugifyService from '#services/slugify_service';
import PaginatedUsers from '#types/paginated/paginated_users';
import SerializedUser from '#types/serialized/serialized_user';
import StringService from '#services/string_service';
import { DeleteUserResult } from '#types/delete_user_result';

@inject()
export default class AdminUserController {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly fileService: FileService,
        private readonly slugifyService: SlugifyService,
        private readonly stringService: StringService
    ) {}

    public async getAll({ request, response }: HttpContext) {
        const { query, page, limit, sortBy: inputSortBy } = await request.validateUsing(searchAdminUsersValidator);

        return response.ok(
            await cache.getOrSet({
                key: `admin-users:query:${query.toLowerCase()}:page:${page}:limit:${limit}:sortBy:${inputSortBy}`,
                tags: [`admin-users`],
                ttl: '1h',
                factory: async (): Promise<PaginatedUsers> => {
                    const [field, order] = inputSortBy.split(':');
                    const sortBy = { field: this.stringService.toSnakeCase(field) as keyof User['$attributes'], order: order as 'asc' | 'desc' };

                    return await this.userRepository.getAdminUsers(query.toLowerCase(), page, limit, sortBy);
                },
            })
        );
    }

    public async delete({ request, response, i18n, user }: HttpContext) {
        const { users } = await request.validateUsing(deleteUsersValidator);
        const statuses: DeleteUserResult[] = await this.userRepository.delete(users, user);

        return response.ok({
            messages: await Promise.all(
                statuses.map(async (status: DeleteUserResult): Promise<{ id: string; message: string; isSuccess: boolean }> => {
                    if (status.isDeleted) {
                        await cache.deleteByTag({ tags: ['admin-users', `admin-user:${status.id}`] });
                        return { id: status.id, message: i18n.t(`messages.admin.user.delete.success`, { username: status.username }), isSuccess: true };
                    } else {
                        if (status.isCurrentUser) {
                            return { id: status.id, message: i18n.t(`messages.admin.user.delete.error.current`, { username: status.username }), isSuccess: false };
                        } else {
                            return { id: status.id, message: i18n.t(`messages.admin.user.delete.error.default`, { id: status.id }), isSuccess: false };
                        }
                    }
                })
            ),
        });
    }

    public async create({ request, response, i18n }: HttpContext) {
        const { username, email, profilePicture: inputProfilePicture } = await request.validateUsing(createUserValidator);

        let user: User | null = await this.userRepository.findOneBy({ email });
        if (user) {
            return response.badRequest({ error: i18n.t('messages.admin.user.create.error.already-exists', { email }) });
        }

        let profilePicture: File | undefined = undefined;
        if (inputProfilePicture) {
            profilePicture = await this.processInputProfilePicture(inputProfilePicture);
        }

        user = await User.create({
            username,
            email,
            profilePictureId: profilePicture?.id,
            password: cuid(),
        });

        await Promise.all([user.load('profilePicture'), cache.deleteByTag({ tags: ['admin-users'] })]);

        return response.created({ user: user.apiSerialize(), message: i18n.t('messages.admin.user.create.success', { email, username }) });
    }

    public async update({ request, response, i18n }: HttpContext) {
        const { username, email, profilePicture: inputProfilePicture } = await request.validateUsing(updateUserValidator);

        const user: User = await this.userRepository.firstOrFail({ email }, ['profilePicture']);

        user.username = username;

        if (inputProfilePicture) {
            if (user.profilePicture && !this.areSameFiles(user.profilePicture, inputProfilePicture)) {
                this.fileService.delete(user.profilePicture);
            }
            const profilePicture: File = await this.processInputProfilePicture(inputProfilePicture);
            user.profilePictureId = profilePicture.id;
            await Promise.all([
                user.load('profilePicture'),
                cache.set({
                    key: `user-profile-picture:${user.id}`,
                    tags: [`user:${user.id}`],
                    ttl: '1h',
                    value: app.makePath(profilePicture.path),
                }),
            ]);
        }

        await user.save();

        if (inputProfilePicture && user.profilePicture && !this.areSameFiles(user.profilePicture, inputProfilePicture)) {
            await user.profilePicture.delete();
        }

        await Promise.all([cache.deleteByTag({ tags: ['admin-users', `admin-user:${user.id}`] })]);

        return response.ok({ user: user.apiSerialize(), message: i18n.t('messages.admin.user.update.success', { username }) });
    }

    public async get({ request, response, i18n }: HttpContext) {
        const { id } = await getAdminUserValidator.validate(request.params());
        const user: User | null = await this.userRepository.findOneBy({ id }, ['profilePicture']);
        if (!user) {
            return response.notFound({ error: i18n.t('messages.admin.user.get.error.not-found') });
        }

        return response.ok(
            await cache.getOrSet({
                key: `admin-user:${user.id}`,
                tags: [`admin-user:${user.id}`],
                ttl: '1h',
                factory: (): SerializedUser => {
                    return user.apiSerialize();
                },
            })
        );
    }

    private async processInputProfilePicture(inputProfilePicture: MultipartFile): Promise<File> {
        try {
            const originalName: string = inputProfilePicture.clientName;
            const slugifiedName: string = this.slugifyService.slugify(originalName);
            const extension: string = path.extname(originalName);
            const uniqueFilename: string = `${slugifiedName.replace(extension, '')}-${Date.now()}${extension}`;

            const profilePicturePath: string = 'static/profile-picture';
            const fullPath: string = app.makePath(profilePicturePath);

            await inputProfilePicture.move(fullPath, { name: uniqueFilename });

            return await File.create({
                name: uniqueFilename,
                path: `${profilePicturePath}/${uniqueFilename}`,
                extension,
                mimeType: `${inputProfilePicture.type}/${inputProfilePicture.subtype}`,
                size: inputProfilePicture.size,
                type: FileTypeEnum.PROFILE_PICTURE,
            });
        } catch (error) {
            throw error;
        }
    }

    private areSameFiles(file: File, multipartFile: MultipartFile): boolean {
        return file.extension === path.extname(multipartFile.clientName) && file.mimeType === multipartFile.headers['content-type'] && file.size === multipartFile.size;
    }
}

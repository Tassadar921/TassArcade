import BaseRepository from '#repositories/base/base_repository';
import User from '#models/user';
import { ModelPaginatorContract, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model';
import PaginatedUsers from '#types/paginated/paginated_users';
import SerializedUser from '#types/serialized/serialized_user';
import { inject } from '@adonisjs/core';
import LogUserRepository from '#repositories/log_user_repository';
import db from '@adonisjs/lucid/services/db';
import { DeleteUserResult } from '#types/delete_user_result';
import { TransactionClientContract } from '@adonisjs/lucid/types/database';

@inject()
export default class UserRepository extends BaseRepository<typeof User> {
    constructor(private readonly logUserRepository: LogUserRepository) {
        super(User);
    }

    public async getAdminUsers(query: string, page: number, limit: number, sortBy: { field: keyof User['$attributes']; order: 'asc' | 'desc' }): Promise<PaginatedUsers> {
        const paginator: ModelPaginatorContract<User> = await this.Model.query()
            .if(query, (queryBuilder: ModelQueryBuilderContract<typeof User>): void => {
                queryBuilder.where('username', 'ILIKE', `%${query}%`).orWhere('email', 'ILIKE', `%${query}%`);
            })
            .if(sortBy, (queryBuilder: ModelQueryBuilderContract<typeof User>): void => {
                queryBuilder.orderBy(sortBy.field as string, sortBy.order);
            })
            .paginate(page, limit);

        return {
            users: paginator.all().map((user: User): SerializedUser => user.apiSerialize()),
            firstPage: paginator.firstPage,
            lastPage: paginator.lastPage,
            limit,
            total: paginator.total,
            currentPage: paginator.currentPage,
        };
    }

    public async delete(ids: string[], currentUser: User): Promise<DeleteUserResult[]> {
        return Promise.all(
            ids.map(async (id: string): Promise<DeleteUserResult> => {
                try {
                    const user: User = await User.query().where('id', id).firstOrFail();

                    if (user.id === currentUser.id) {
                        return {
                            isDeleted: false,
                            isCurrentUser: true,
                            username: user.username,
                            id,
                        };
                    }

                    return await db.transaction(async (trx: TransactionClientContract): Promise<DeleteUserResult> => {
                        await user.useTransaction(trx).delete();

                        await this.logUserRepository.deleteByUser(user, trx);

                        return {
                            isDeleted: true,
                            username: user.username,
                            id,
                        };
                    });
                } catch (error) {
                    console.error('Delete user error:', error);
                    return { isDeleted: false, id };
                }
            })
        );
    }
}

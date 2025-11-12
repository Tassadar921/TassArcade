import BaseRepository from '#repositories/base/base_repository';
import LogUser from '#models/log_user';
import User from '#models/user';
import { inject } from '@adonisjs/core';
import LogRepository from '#repositories/log_repository';
import { TransactionClientContract } from '@adonisjs/lucid/types/database';
import db from '@adonisjs/lucid/services/db';

@inject()
export default class LogUserRepository extends BaseRepository<typeof LogUser> {
    constructor(private readonly logRepository: LogRepository) {
        super(LogUser);
    }

    public async deleteByUser(user: User, trx?: TransactionClientContract): Promise<void> {
        if (trx) {
            await this.logRepository.deleteByUser(user, trx);
            await this.Model.query({ client: trx }).where('email', user.email).delete();
            return;
        }

        await db.transaction(async (localTrx: TransactionClientContract): Promise<void> => {
            await this.logRepository.deleteByUser(user, localTrx);
            await this.Model.query({ client: localTrx }).where('email', user.email).delete();
        });
    }
}

import BaseRepository from '#repositories/base/base_repository';
import Log from '#models/log';
import User from '#models/user';
import db from '@adonisjs/lucid/services/db';
import { TransactionClientContract } from '@adonisjs/lucid/types/database';

export default class LogRepository extends BaseRepository<typeof Log> {
    constructor() {
        super(Log);
    }

    public async deleteByUser(user: User, trx?: TransactionClientContract): Promise<void> {
        if (trx) {
            await this.Model.query({ client: trx }).from('logs').join('log_users', 'logs.user_id', 'log_users.id').where('log_users.email', user.email).delete();
            return;
        }

        await db.connection('logs').transaction(async (localTrx: TransactionClientContract): Promise<void> => {
            await this.Model.query({ client: localTrx }).from('logs').join('log_users', 'logs.user_id', 'log_users.id').where('log_users.email', user.email).delete();
        });
    }
}

import { BaseSeeder } from '@adonisjs/lucid/seeders';
import env from '#start/env';
import User from '#models/user';
import UserRepository from '#repositories/user_repository';
import UserRoleEnum from '#types/enum/user_role_enum';
import FileService from '#services/file_service';
import LogUserRepository from '#repositories/log_user_repository';
import LogRepository from '#repositories/log_repository';

export default class extends BaseSeeder {
    private readonly userRepository: UserRepository = new UserRepository(new FileService(), new LogUserRepository(new LogRepository()));

    public async run(): Promise<void> {
        const emails: string[] = JSON.parse(env.get('ADDITIONAL_EMAILS'));
        for (const email of [...emails, env.get('ADMIN_EMAIL')]) {
            if (!(await this.userRepository.findOneBy({ email }))) {
                await User.create({
                    username: email.split('@')[0].replaceAll('.', ''),
                    email,
                    password: 'xxx',
                    role: email === env.get('ADMIN_EMAIL') ? UserRoleEnum.ADMIN : UserRoleEnum.USER,
                    enabled: true,
                    acceptedTermsAndConditions: true,
                });
            }
        }
    }
}

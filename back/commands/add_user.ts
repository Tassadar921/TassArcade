import { BaseCommand } from '@adonisjs/core/ace';
import type { CommandOptions } from '@adonisjs/core/types/ace';
import User from '#models/user';
import UserRoleEnum from '#types/enum/user_role_enum';
import UserRepository from '#repositories/user_repository';
import RegexService from '#services/regex_service';

export default class AddUser extends BaseCommand {
    private readonly userRepository: UserRepository = new UserRepository();
    private readonly regexService: RegexService = new RegexService();

    private email: string = '';
    private role: UserRoleEnum = UserRoleEnum.USER;

    public static commandName: string = 'add:user';
    public static description: string = 'Add a new user';

    public static options: CommandOptions = {
        startApp: true,
    };

    public async interact(): Promise<void> {
        const email: string = await this.prompt.ask('Enter email');

        if (!email) {
            this.logger.error('Please provide an email');
            return;
        }

        if (!this.regexService.isValidEmail(email)) {
            this.logger.error('Please provide a valid email');
            return;
        }

        const user: User | null = await this.userRepository.findOneBy({
            email: email,
        });
        if (user) {
            this.logger.error('User already exists');
            return;
        }

        this.email = email;

        this.role = await this.prompt.choice('Select account type', [
            {
                name: UserRoleEnum.ADMIN,
                message: 'Admin (Complete access : add, remove files)',
            },
            {
                name: UserRoleEnum.USER,
                message: 'User',
            },
        ]);
    }

    public async run(): Promise<void> {
        await User.create({
            username: this.email.split('@')[0],
            email: this.email,
            role: this.role,
            password: 'xxx',
            enabled: true,
        });
        this.logger.success('User created successfully');
    }
}

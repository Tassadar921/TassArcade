import router from '@adonisjs/core/services/router';
import { middleware } from '#start/kernel';

// Transmit controllers
const EventStreamController = () => import('@adonisjs/transmit/controllers/event_stream_controller');
const SubscribeController = () => import('@adonisjs/transmit/controllers/subscribe_controller');
const UnsubscribeController = () => import('@adonisjs/transmit/controllers/unsubscribe_controller');

// Admin controllers
const AdminUserController = () => import('#controllers/admin/user_controller');
const AdminEquipmentController = () => import('#controllers/admin/equipment_controller');
const AdminEquipmentTypeController = () => import('#controllers/admin/equipment_type_controller');

// App controllers
const HealthCheckController = () => import('#controllers/health_checks_controller');
const LanguageController = () => import('#controllers/language_controller');
const AuthController = () => import('#controllers/auth_controller');
const ProfileController = () => import('#controllers/profile_controller');
const FileController = () => import('#controllers/file_controller');
const OauthController = () => import('#controllers/oauth_controller');
const EquipmentController = () => import('#controllers/equipment_controller');
const ClusterController = () => import('#controllers/cluster_controller');
const CountryController = () => import('#controllers/country_controller');
const CompanyController = () => import('#controllers/company_controller');
const CompanyAdministratorController = () => import('#controllers/company_administrator_controller');
const CompanyEquipmentTypeController = () => import('#controllers/company_equipment_type_controller');

router.get('healthcheck', [HealthCheckController]);

router
    .group((): void => {
        router
            .group((): void => {
                // Classic authentication routes
                router.post('/', [AuthController, 'login']);

                // OAuth routes
                router
                    .group((): void => {
                        router.get('/', [OauthController, 'github']);
                        router.get('/callback', [OauthController, 'githubCallback']);
                    })
                    .prefix('github');
                router
                    .group((): void => {
                        router.get('/', [OauthController, 'discord']);
                        router.get('/callback', [OauthController, 'discordCallback']);
                    })
                    .prefix('discord');
                router
                    .group((): void => {
                        router.get('/', [OauthController, 'google']);
                        router.get('/callback', [OauthController, 'googleCallback']);
                    })
                    .prefix('google');

                router.post('/confirm/:provider/:token', [OauthController, 'confirmOauthConnection']);
            })
            .prefix('auth');

        // Classic account creation routes
        router
            .group((): void => {
                router.post('/send-mail', [AuthController, 'sendAccountCreationEmail']);
                router.post('/confirm/:token', [AuthController, 'confirmAccountCreation']);
            })
            .prefix('account-creation');

        router
            .group((): void => {
                router.post('/send-mail', [ProfileController, 'sendResetPasswordEmail']);
                router.post('/confirm/:token', [ProfileController, 'resetPassword']);
            })
            .prefix('reset-password');

        // Authenticated routes
        router
            .group((): void => {
                // Authentication check route
                router.get('/', (): { isSessionTokenValid: boolean } => {
                    return { isSessionTokenValid: true };
                });

                // Admin routes
                router
                    .group((): void => {
                        router
                            .group((): void => {
                                router.get('/', [AdminUserController, 'getAll']);
                                router.post('/delete', [AdminUserController, 'delete']);
                                router.post('/create', [AdminUserController, 'create']);
                                router.post('/update', [AdminUserController, 'update']);
                                router.get('/:id', [AdminUserController, 'get']);
                            })
                            .prefix('user');

                        router
                            .group((): void => {
                                router.get('/', [AdminEquipmentController, 'getAll']);
                                router.post('/delete', [AdminEquipmentController, 'delete']);
                                router.post('/create', [AdminEquipmentController, 'create']);
                                router.post('/update', [AdminEquipmentController, 'update']);
                                router.get('/:id', [AdminEquipmentController, 'get']);
                            })
                            .prefix('equipment');

                        router
                            .group((): void => {
                                router.get('/', [AdminEquipmentTypeController, 'getAll']);
                                router.post('/delete', [AdminEquipmentTypeController, 'delete']);
                                router.post('/create', [AdminEquipmentTypeController, 'create']);
                                router.post('/update', [AdminEquipmentTypeController, 'update']);
                                router.get('/:id', [AdminEquipmentTypeController, 'get']);
                            })
                            .prefix('equipment-type');
                    })
                    .prefix('admin')
                    .use([middleware.isAdmin()]);

                router.delete('/logout', [AuthController, 'logout']);

                router
                    .group((): void => {
                        router.get('/', [ProfileController, 'getProfile']);
                        router.post('/update', [ProfileController, 'updateProfile']);
                        router
                            .group((): void => {
                                router.get('/', [CompanyController, 'getAll']);
                                router.post('/delete', [CompanyController, 'delete']);
                                router.post('/update', [CompanyController, 'update']);
                                router.post('/confirm', [CompanyController, 'confirm']);
                                router
                                    .group((): void => {
                                        router.get('/', [CompanyController, 'getOne']);
                                        router
                                            .group((): void => {
                                                router.get('/init', [CompanyAdministratorController, 'init']);
                                                router.get('/', [CompanyAdministratorController, 'getAll']);
                                                router.get('/search', [CompanyAdministratorController, 'searchUsers']);
                                                router.post('/add', [CompanyAdministratorController, 'addAdministrator']);
                                                router.post('/remove', [CompanyAdministratorController, 'removeAdministrator']);
                                            })
                                            .prefix('administrators');

                                        router
                                            .group((): void => {
                                                router.get('/init', [CompanyEquipmentTypeController, 'init']);
                                                router.get('/', [CompanyEquipmentTypeController, 'getAll']);
                                                router.get('/:companyEquipmentTypeId', [CompanyEquipmentTypeController, 'getOne']);
                                                router.post('/add', [CompanyEquipmentTypeController, 'addEquipment']);
                                                router.post('/:companyEquipmentTypeId/update', [CompanyEquipmentTypeController, 'updateEquipment']);
                                                router.post('/remove', [CompanyEquipmentTypeController, 'removeEquipment']);
                                            })
                                            .prefix('equipments');
                                    })
                                    .prefix(':companyId');
                            })
                            .prefix('company');
                    })
                    .prefix('profile');

                router
                    .group((): void => {
                        router.get('/siret/:siret', [CompanyController, 'getFromSiret']);
                        router.post('/new', [CompanyController, 'create']);
                    })
                    .prefix('company');

                router
                    .group((): void => {
                        router.get('/profile-picture/:userId', [FileController, 'serveStaticProfilePictureFile']);
                    })
                    .prefix('static');

                router.get('/languages/all', [LanguageController, 'getAll']);
            })
            .use([middleware.auth()]);

        router.get('/equipments/all', [EquipmentController, 'getAll']);
        router.get('/equipments', [EquipmentController, 'searchEquipments']);
        router.get('/countries', [CountryController, 'getAll']);
        router.post('/clusters', [ClusterController, 'get']);

        router
            .group((): void => {
                router.get('/equipment-thumbnail/:equipmentId', [FileController, 'serveStaticEquipmentThumbnailFile']);
                router.get('/company-logo/:companyId', [FileController, 'serveStaticCompanyLogoFile']);
                router.get('/language-flag/:languageId', [FileController, 'serveStaticLanguageFlagFile']);
            })
            .prefix('static');
    })
    .prefix('api')
    .use([middleware.log(), middleware.language()]);

router.get('/__transmit/events', [EventStreamController]);
router.post('/__transmit/subscribe', [SubscribeController]);
router.post('/__transmit/unsubscribe', [UnsubscribeController]);

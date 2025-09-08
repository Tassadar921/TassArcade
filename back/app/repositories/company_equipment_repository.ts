import BaseRepository from '#repositories/base/base_repository';
import CompanyAdministrator from '#models/company_administrator';

export default class CompanyAdministratorRepository extends BaseRepository<typeof CompanyAdministrator> {
    constructor() {
        super(CompanyAdministrator);
    }
}

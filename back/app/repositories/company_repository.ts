import BaseRepository from '#repositories/base/base_repository';
import Company from '#models/company';

export default class CompanyRepository extends BaseRepository<typeof Company> {
    constructor() {
        super(Company);
    }
}

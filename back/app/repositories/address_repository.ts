import BaseRepository from '#repositories/base/base_repository';
import Address from '#models/address';

export default class AddressRepository extends BaseRepository<typeof Address> {
    constructor() {
        super(Address);
    }
}

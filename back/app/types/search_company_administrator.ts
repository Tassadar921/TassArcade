import SerializedUser from '#types/serialized/serialized_user';

export type SearchCompanyAdministrator = {
    user: SerializedUser;
    isAdministrator: boolean;
};

export default SearchCompanyAdministrator;

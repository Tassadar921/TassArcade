export interface DeleteUserResult {
    isDeleted: boolean;
    isCurrentUser?: boolean;
    username?: string;
    id: string;
}

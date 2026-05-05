export type tUserProfile = {
    id: number;
    email: string;
    name: string;
    organization?: string | null;
    profileImageUrl?: string | null;
};

export type tUpdateUserProfile = {
    name: string;
};

export type tUpdateUserEmail = {
    email: string;
};

export type tDeleteMyAccount = {
    password: string;
};

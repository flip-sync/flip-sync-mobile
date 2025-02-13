export type tVerifyEmail = {
    email: string;
    code: string;
};
export type tSignUp = {
    email: string;
    password: string;
    passwordConfirm: string;
    name: string;
};
export type tSignIn = {
    email: string;
    password: string;
};
export type tSignInRessponse = {
    accessToken: string;
    accessTokenExpiresIn: number;
    refreshToken: string;
};

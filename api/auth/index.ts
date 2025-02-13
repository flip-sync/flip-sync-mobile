import { baseUrl } from "..";
import { IApiResponse } from "../types";
import { tSignIn, tSignInRessponse, tSignUp, tVerifyEmail } from "./types";

export interface IAuthApi {
    requestVerifyEmaill: (email: string) => Promise<IApiResponse<any>>;
    checkVerifyEmail: (props: tVerifyEmail) => Promise<IApiResponse<any>>;
    signUp: (props: tSignUp) => Promise<IApiResponse<any>>;
    signIn: (props: tSignIn) => Promise<IApiResponse<tSignInRessponse>>;
}

export const authApi: IAuthApi = {
    requestVerifyEmaill: (email: string) => {
        return baseUrl.get("/user/verify-email", {
            params: {
                email
            }
        });
    },
    checkVerifyEmail: (props: tVerifyEmail) => baseUrl.post("/user/verify-email/check", props),
    signUp: (props: tSignUp) => baseUrl.post("/user/signup", props),
    signIn: (props: tSignIn) => baseUrl.post("/user/login", props)
};

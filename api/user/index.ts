import { baseUrl } from "..";
import { IApiResponse } from "../types";
import { tDeleteMyAccount, tUpdateUserEmail, tUpdateUserProfile, tUserProfile } from "./types";

type tTokenResponse = {
    accessToken: string;
    accessTokenExpiresIn: number;
    refreshToken: string;
};

export interface IUserApi {
    getMyProfile: () => Promise<IApiResponse<tUserProfile>>;
    updateMyProfile: (payload: tUpdateUserProfile) => Promise<IApiResponse<tUserProfile>>;
    updateMyProfileImage: (formData: FormData) => Promise<IApiResponse<tUserProfile>>;
    updateMyEmail: (payload: tUpdateUserEmail) => Promise<IApiResponse<tTokenResponse>>;
    deleteMyAccount: (payload: tDeleteMyAccount) => Promise<IApiResponse<void>>;
}

export const userApi: IUserApi = {
    getMyProfile: () => baseUrl.get("/user/me"),
    updateMyProfile: payload => baseUrl.put("/user/me", payload),
    updateMyProfileImage: formData =>
        baseUrl.put("/user/me/profile-image", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }),
    updateMyEmail: payload => baseUrl.put("/user/me/email", payload),
    deleteMyAccount: payload => baseUrl.delete("/user/me", { data: payload })
};

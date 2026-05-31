import { apiRequest } from "./client";
import type {
  CommonResDto,
  TokenReqDto,
  TokenResDto,
  UserLoginReqDto,
  UserResetPasswordReqDto,
  UserSignupReqDto,
  UserVerifyEmailReqDto
} from "./types";

const unwrapData = <T>(response: CommonResDto<T>) => response.data as T;

export const signup = async (payload: UserSignupReqDto) =>
  unwrapData(await apiRequest<number>("/user/signup", { method: "POST", body: payload, skipAuthRefresh: true }));

export const login = async (payload: UserLoginReqDto) =>
  unwrapData(await apiRequest<TokenResDto>("/user/login", { method: "POST", body: payload, skipAuthRefresh: true }));

export const verifyEmail = async (email: string) =>
  unwrapData(await apiRequest<void>(`/user/verify-email?email=${encodeURIComponent(email)}`, { method: "GET", skipAuthRefresh: true }));

export const checkVerifyEmail = async (payload: UserVerifyEmailReqDto) =>
  unwrapData(await apiRequest<void>("/user/verify-email/check", { method: "POST", body: payload, skipAuthRefresh: true }));

export const refreshToken = async (payload: TokenReqDto) =>
  unwrapData(await apiRequest<TokenResDto>("/user/login/refresh", { method: "POST", body: payload, skipAuthRefresh: true }));

export const resetPassword = async (payload: UserResetPasswordReqDto) =>
  unwrapData(await apiRequest<void>("/user/reset-password", { method: "POST", body: payload, skipAuthRefresh: true }));

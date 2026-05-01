export type CommonResDto<T = unknown> = {
  code: string;
  message: string;
  data?: T | null;
};

export type TokenResDto = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
};

export type UserSignupReqDto = {
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
};

export type UserLoginReqDto = {
  email: string;
  password: string;
};

export type UserVerifyEmailReqDto = {
  email: string;
  code: string;
};

export type UserResetPasswordReqDto = {
  email: string;
  password: string;
  passwordConfirm: string;
};

export type TokenReqDto = {
  refreshToken: string;
};

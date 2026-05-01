import type { TokenResDto } from "./types";

let authSession: TokenResDto | null = null;

export const getAuthSession = () => authSession;

export const setAuthSession = (session: TokenResDto) => {
  authSession = session;
};

export const clearAuthSession = () => {
  authSession = null;
};

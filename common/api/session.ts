import type { TokenResDto } from "./types";

let authSession: TokenResDto | null = null;
const authSessionListeners = new Set<(session: TokenResDto | null) => void>();

const notifyAuthSessionListeners = () => {
  authSessionListeners.forEach(listener => listener(authSession));
};

export const getAuthSession = () => authSession;

export const setAuthSession = (session: TokenResDto) => {
  authSession = session;
  notifyAuthSessionListeners();
};

export const clearAuthSession = () => {
  authSession = null;
  notifyAuthSessionListeners();
};

export const subscribeAuthSession = (listener: (session: TokenResDto | null) => void) => {
  authSessionListeners.add(listener);

  return () => {
    authSessionListeners.delete(listener);
  };
};

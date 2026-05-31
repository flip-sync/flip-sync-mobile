import AsyncStorage from "@react-native-async-storage/async-storage";
import type { TokenResDto } from "./types";

export const AUTH_TOKEN_STORAGE_KEY = "token";

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

export const getStoredAuthSession = async () => {
  if (authSession) {
    return authSession;
  }

  const rawSession = await AsyncStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  if (!rawSession) {
    return null;
  }

  try {
    const parsedSession = JSON.parse(rawSession) as TokenResDto;
    if (!parsedSession.accessToken || !parsedSession.refreshToken) {
      await AsyncStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      return null;
    }

    setAuthSession(parsedSession);
    return parsedSession;
  } catch {
    await AsyncStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    return null;
  }
};

export const persistAuthSession = async (session: TokenResDto) => {
  setAuthSession(session);
  await AsyncStorage.setItem(AUTH_TOKEN_STORAGE_KEY, JSON.stringify(session));
};

export const removeAuthSession = async () => {
  clearAuthSession();
  await AsyncStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
};

export const subscribeAuthSession = (listener: (session: TokenResDto | null) => void) => {
  authSessionListeners.add(listener);

  return () => {
    authSessionListeners.delete(listener);
  };
};

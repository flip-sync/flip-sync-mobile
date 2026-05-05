import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export type ActiveOrganizationSession = {
  id: number;
  name: string;
  inviteCode: string;
  creatorId: number;
  creatorName: string;
  memberCount: number;
  role: "LEADER" | "MEMBER";
  isLeader: boolean;
};

export const ACTIVE_ORGANIZATION_STORAGE_KEY = "activeOrganization";

let activeOrganizationSession: ActiveOrganizationSession | null = null;
const activeOrganizationListeners = new Set<
  (session: ActiveOrganizationSession | null) => void
>();

const notifyActiveOrganizationListeners = () => {
  activeOrganizationListeners.forEach(listener => listener(activeOrganizationSession));
};

export const getActiveOrganizationSession = () => activeOrganizationSession;

export const setActiveOrganizationSession = (session: ActiveOrganizationSession) => {
  activeOrganizationSession = session;
  notifyActiveOrganizationListeners();
};

export const persistActiveOrganizationSession = async (
  session: ActiveOrganizationSession
) => {
  setActiveOrganizationSession(session);
  await AsyncStorage.setItem(ACTIVE_ORGANIZATION_STORAGE_KEY, JSON.stringify(session));
};

export const clearActiveOrganizationSession = () => {
  activeOrganizationSession = null;
  notifyActiveOrganizationListeners();
};

export const removeActiveOrganizationSession = async () => {
  clearActiveOrganizationSession();
  await AsyncStorage.removeItem(ACTIVE_ORGANIZATION_STORAGE_KEY);
};

export const subscribeActiveOrganizationSession = (
  listener: (session: ActiveOrganizationSession | null) => void
) => {
  activeOrganizationListeners.add(listener);

  return () => {
    activeOrganizationListeners.delete(listener);
  };
};

export const useActiveOrganizationSession = () => {
  const [session, setSession] = useState<ActiveOrganizationSession | null>(
    getActiveOrganizationSession()
  );

  useEffect(() => {
    return subscribeActiveOrganizationSession(setSession);
  }, []);

  return session;
};

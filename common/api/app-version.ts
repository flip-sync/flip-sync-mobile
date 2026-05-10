import { Platform } from "react-native";
import { apiRequest } from "./client";

export type AppVersionPlatform = "android" | "ios";

export type AppVersionPolicy = {
  platform: AppVersionPlatform;
  latestVersion: string;
  latestBuildVersion: number;
  minimumBuildVersion: number;
  storeUrl: string;
  forceUpdateMessage: string;
  optionalUpdateMessage: string;
};

const getCurrentPlatform = (): AppVersionPlatform => (Platform.OS === "ios" ? "ios" : "android");

export const getAppVersionPolicy = async (platform: AppVersionPlatform = getCurrentPlatform()) => {
  const response = await apiRequest<AppVersionPolicy>(
    `/app/version-policy?platform=${encodeURIComponent(platform)}`,
    { method: "GET" }
  );

  if (!response.data) {
    throw new Error("App version policy is empty");
  }

  return response.data;
};

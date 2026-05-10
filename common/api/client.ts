import type { CommonResDto } from "./types";
import { getAuthSession } from "./session";
import { getActiveOrganizationSession } from "./organization-session";
import Constants from "expo-constants";

const DEFAULT_API_BASE_URL = "https://fliplyze.com/mob";

export const getApiBaseUrl = () => {
  const extraApiUrl =
    typeof Constants.expoConfig?.extra?.apiUrl === "string"
      ? Constants.expoConfig.extra.apiUrl
      : undefined;
  const baseUrl =
    process.env.EXPO_PUBLIC_API_BASE_URL?.trim() ||
    process.env.EXPO_PUBLIC_API_URL?.trim() ||
    extraApiUrl?.trim() ||
    DEFAULT_API_BASE_URL;

  return baseUrl.replace(/\/$/, "");
};

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | Record<string, unknown> | null;
  skipJsonContentType?: boolean;
};

const buildBody = (body: ApiRequestOptions["body"]) => {
  if (body == null) {
    return undefined;
  }

  if (typeof FormData !== "undefined" && body instanceof FormData) {
    return body;
  }

  if (
    typeof body === "string" ||
    body instanceof Blob ||
    body instanceof ArrayBuffer ||
    body instanceof URLSearchParams
  ) {
    return body;
  }

  return JSON.stringify(body);
};

export const apiRequest = async <T>(path: string, options: ApiRequestOptions = {}) => {
  const headers = new Headers(options.headers);
  const body = buildBody(options.body);
  const isFormDataBody = typeof FormData !== "undefined" && body instanceof FormData;
  const authSession = getAuthSession();
  const activeOrganizationSession = getActiveOrganizationSession();

  if (authSession?.accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${authSession.accessToken}`);
  }

  if (activeOrganizationSession?.id && !headers.has("X-Organization-Id")) {
    headers.set("X-Organization-Id", String(activeOrganizationSession.id));
  }

  if (body && !isFormDataBody && !options.skipJsonContentType && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers,
    body
  });

  const text = await response.text();
  let payload: CommonResDto<T> | null = null;

  if (text.length > 0) {
    try {
      payload = JSON.parse(text) as CommonResDto<T>;
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const errorMessage = payload?.message ?? response.statusText;
    throw new Error(errorMessage);
  }

  if (!payload) {
    throw new Error("Empty response body");
  }

  return payload;
};

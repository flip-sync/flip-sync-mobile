import axios from "axios";
import { getApiBaseUrl } from "@/common/api/client";
import setupInterceptorsTo from "./interceptors";

export const baseUrl = setupInterceptorsTo(
  axios.create({
    baseURL: getApiBaseUrl()
  })
);

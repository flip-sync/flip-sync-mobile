import { baseUrl } from "..";
import { IApiResponse } from "../types";
import {
  tCreateOrganization,
  tJoinOrganization,
  tOrganizationDetail,
  tOrganizationSummary
} from "./types";

export interface IOrganizationApi {
  getMyOrganizations: () => Promise<IApiResponse<tOrganizationSummary[]>>;
  getOrganizationDetail: (organizationId: number) => Promise<IApiResponse<tOrganizationDetail>>;
  createOrganization: (
    payload: tCreateOrganization
  ) => Promise<IApiResponse<tOrganizationSummary>>;
  joinOrganization: (payload: tJoinOrganization) => Promise<IApiResponse<tOrganizationSummary>>;
  deleteOrganization: (organizationId: number) => Promise<IApiResponse<any>>;
}

export const organizationApi: IOrganizationApi = {
  getMyOrganizations: () => baseUrl.get("/organization/my"),
  getOrganizationDetail: organizationId => baseUrl.get(`/organization/${organizationId}`),
  createOrganization: payload => baseUrl.post("/organization", payload),
  joinOrganization: payload => baseUrl.post("/organization/join", payload),
  deleteOrganization: organizationId => baseUrl.delete(`/organization/${organizationId}`)
};

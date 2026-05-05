import { organizationApi } from "@/api/organization";
import {
  tCreateOrganization,
  tJoinOrganization,
  tOrganizationSummary
} from "@/api/organization/types";
import { useActiveOrganizationSession } from "@/common";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useOrganization = () => {
  const queryClient = useQueryClient();
  const activeOrganization = useActiveOrganizationSession();

  const { data: organizations, isLoading: isLoadingOrganizations } = useQuery({
    queryKey: ["organizations"],
    queryFn: () => organizationApi.getMyOrganizations()
  });

  const { data: organizationDetail, isLoading: isLoadingOrganizationDetail } = useQuery({
    queryKey: ["organization-detail", activeOrganization?.id],
    queryFn: () => organizationApi.getOrganizationDetail(activeOrganization!.id),
    enabled: Boolean(activeOrganization?.id)
  });

  const invalidateOrganizationQueries = async () => {
    await queryClient.invalidateQueries({ queryKey: ["organizations"] });
    await queryClient.invalidateQueries({ queryKey: ["organization-detail"] });
  };

  const { mutateAsync: createOrganization, isPending: isCreatingOrganization } = useMutation({
    mutationFn: (payload: tCreateOrganization) => organizationApi.createOrganization(payload),
    onSuccess: async () => {
      await invalidateOrganizationQueries();
    }
  });

  const { mutateAsync: joinOrganization, isPending: isJoiningOrganization } = useMutation({
    mutationFn: (payload: tJoinOrganization) => organizationApi.joinOrganization(payload),
    onSuccess: async () => {
      await invalidateOrganizationQueries();
    }
  });

  const { mutateAsync: deleteOrganization, isPending: isDeletingOrganization } = useMutation({
    mutationFn: (organizationId: number) => organizationApi.deleteOrganization(organizationId),
    onSuccess: async () => {
      await invalidateOrganizationQueries();
    }
  });

  return {
    organizations,
    isLoadingOrganizations,
    organizationDetail,
    isLoadingOrganizationDetail,
    createOrganization,
    isCreatingOrganization,
    joinOrganization,
    isJoiningOrganization,
    deleteOrganization,
    isDeletingOrganization
  };
};

export const toActiveOrganizationSession = (organization: tOrganizationSummary) => ({
  id: organization.id,
  name: organization.name,
  inviteCode: organization.inviteCode,
  creatorId: organization.creatorId,
  creatorName: organization.creatorName,
  memberCount: organization.memberCount,
  role: organization.role,
  isLeader: organization.isLeader
});

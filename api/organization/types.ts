export type tOrganizationRole = "LEADER" | "MEMBER";

export type tOrganizationSummary = {
  id: number;
  name: string;
  inviteCode: string;
  creatorId: number;
  creatorName: string;
  memberCount: number;
  role: tOrganizationRole;
  isLeader: boolean;
};

export type tOrganizationMember = {
  userId: number;
  email: string;
  name: string;
  profileImageUrl?: string | null;
  role: tOrganizationRole;
  joinedAt: string;
};

export type tOrganizationDetail = {
  id: number;
  name: string;
  inviteCode: string;
  creatorId: number;
  creatorName: string;
  role: tOrganizationRole;
  isLeader: boolean;
  memberCount: number;
  members: tOrganizationMember[];
};

export type tCreateOrganization = {
  name: string;
};

export type tJoinOrganization = {
  inviteCode: string;
};

"use client";

import { createApi } from "@reduxjs/toolkit/query/react";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { baseQueryWithReauth } from "@/lib/api/baseQueryWithReauth";

export type OrganizationRole = "OWNER" | "ADMIN" | "MANAGER" | "AGENT" | "VIEWER";

export type Organization = {
  id: number;
  name: string;
  type?: string | null;
  logo?: string | null;
  address?: string | null;
  countryCode?: string | null;
  timezone?: string | null;
  createdAt?: string;
  updatedAt?: string;
  role?: { id?: number; name?: OrganizationRole } | null;
  membershipId?: number;
  isDefault?: boolean;
};

export type OrganizationMember = {
  id: number;
  userId: number;
  organizationId: number;
  roleId?: number | null;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
  role?: { id?: number; name?: OrganizationRole; description?: string | null } | null;
  user?: {
    id: number;
    name?: string | null;
    email?: string | null;
    mobileNumber?: string | null;
    profilePhoto?: string | null;
  } | null;
};

export type CreateOrganizationPayload = {
  name: string;
  type?: string;
  logo?: string;
  address?: string;
  countryCode?: string;
};

export type AddOrganizationMemberPayload = {
  orgId: number | string;
  userId: number;
  role: OrganizationRole;
};

export type OrganizationInvitation = {
  id: number;
  organizationId: number;
  mobileNumber: string;
  roleName: Exclude<OrganizationRole, "OWNER">;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "REVOKED" | "EXPIRED" | string;
  expiresAt: string;
  createdAt: string;
  token?: string;
  invitedBy?: OrganizationMember["user"];
};

export type OrganizationActivity = {
  id: number;
  organizationId: number;
  action: string;
  details?: Record<string, unknown> | null;
  createdAt: string;
  actor?: OrganizationMember["user"];
};

export type OrganizationPropertySummary = {
  id: number;
  title?: string | null;
  status?: string | null;
  cityName?: string | null;
  locality?: string | null;
  createdAt?: string;
  media?: Array<{ id?: number; url?: string; type?: string | null }>;
  [key: string]: unknown;
};

export type InviteOrganizationMemberPayload = {
  orgId: number | string;
  mobileNumber: string;
  role: Exclude<OrganizationRole, "OWNER">;
};

export type UpdateOrganizationMemberPayload = {
  orgId: number | string;
  memberId: number | string;
  role: OrganizationRole;
};

const unwrap = <T>(response: { data?: T } | T): T => {
  if (response && typeof response === "object" && "data" in response) {
    return (response as { data?: T }).data as T;
  }
  return response as T;
};

export const organizationsApi = createApi({
  reducerPath: "organizationsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Organization", "OrganizationMember", "OrganizationProperty", "OrganizationInvitation", "OrganizationActivity"],
  endpoints: (builder) => ({
    myOrganizations: builder.query<Organization[], void>({
      query: () => ({ url: API_ENDPOINTS.organizations.my, method: "GET" }),
      transformResponse: (response: { data?: Organization[] } | Organization[]) => unwrap<Organization[]>(response) ?? [],
      providesTags: ["Organization"],
    }),
    createOrganization: builder.mutation<Organization, CreateOrganizationPayload>({
      query: (body) => ({ url: API_ENDPOINTS.organizations.create, method: "POST", body }),
      transformResponse: (response: { data?: Organization } | Organization) => unwrap<Organization>(response),
      invalidatesTags: ["Organization"],
    }),
    organizationMembers: builder.query<OrganizationMember[], number | string>({
      query: (orgId) => ({ url: API_ENDPOINTS.organizations.members(orgId), method: "GET" }),
      transformResponse: (response: { data?: OrganizationMember[] } | OrganizationMember[]) =>
        unwrap<OrganizationMember[]>(response) ?? [],
      providesTags: (_result, _error, orgId) => [{ type: "OrganizationMember", id: orgId }],
    }),
    addOrganizationMember: builder.mutation<OrganizationMember, AddOrganizationMemberPayload>({
      query: ({ orgId, userId, role }) => ({
        url: API_ENDPOINTS.organizations.members(orgId),
        method: "POST",
        body: { userId, role },
      }),
      transformResponse: (response: { data?: OrganizationMember } | OrganizationMember) =>
        unwrap<OrganizationMember>(response),
      invalidatesTags: (_result, _error, args) => [{ type: "OrganizationMember", id: args.orgId }, "Organization"],
    }),
    updateOrganizationMember: builder.mutation<OrganizationMember, UpdateOrganizationMemberPayload>({
      query: ({ orgId, memberId, role }) => ({
        url: API_ENDPOINTS.organizations.member(orgId, memberId),
        method: "PATCH",
        body: { role },
      }),
      transformResponse: (response: { data?: OrganizationMember } | OrganizationMember) =>
        unwrap<OrganizationMember>(response),
      invalidatesTags: (_result, _error, args) => [{ type: "OrganizationMember", id: args.orgId }, "Organization"],
    }),
    removeOrganizationMember: builder.mutation<{ success?: boolean }, { orgId: number | string; memberId: number | string }>({
      query: ({ orgId, memberId }) => ({
        url: API_ENDPOINTS.organizations.member(orgId, memberId),
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, args) => [{ type: "OrganizationMember", id: args.orgId }, "Organization"],
    }),
    organizationProperties: builder.query<OrganizationPropertySummary[], number | string>({
      query: (orgId) => ({ url: API_ENDPOINTS.organizations.properties(orgId), method: "GET" }),
      transformResponse: (response: { data?: OrganizationPropertySummary[] } | OrganizationPropertySummary[]) =>
        unwrap<OrganizationPropertySummary[]>(response) ?? [],
      providesTags: (_result, _error, orgId) => [{ type: "OrganizationProperty", id: orgId }],
    }),
    organizationInvitations: builder.query<OrganizationInvitation[], number | string>({
      query: (orgId) => ({ url: API_ENDPOINTS.organizations.invitations(orgId), method: "GET" }),
      transformResponse: (response: { data?: OrganizationInvitation[] } | OrganizationInvitation[]) =>
        unwrap<OrganizationInvitation[]>(response) ?? [],
      providesTags: (_result, _error, orgId) => [{ type: "OrganizationInvitation", id: orgId }],
    }),
    inviteOrganizationMember: builder.mutation<OrganizationInvitation, InviteOrganizationMemberPayload>({
      query: ({ orgId, mobileNumber, role }) => ({
        url: API_ENDPOINTS.organizations.invitations(orgId),
        method: "POST",
        body: { mobileNumber, role },
      }),
      transformResponse: (response: { data?: OrganizationInvitation } | OrganizationInvitation) =>
        unwrap<OrganizationInvitation>(response),
      invalidatesTags: (_result, _error, args) => [
        { type: "OrganizationInvitation", id: args.orgId },
        { type: "OrganizationActivity", id: args.orgId },
      ],
    }),
    revokeOrganizationInvitation: builder.mutation<OrganizationInvitation, { orgId: number | string; invitationId: number | string }>({
      query: ({ orgId, invitationId }) => ({ url: API_ENDPOINTS.organizations.invitation(orgId, invitationId), method: "DELETE" }),
      transformResponse: (response: { data?: OrganizationInvitation } | OrganizationInvitation) =>
        unwrap<OrganizationInvitation>(response),
      invalidatesTags: (_result, _error, args) => [
        { type: "OrganizationInvitation", id: args.orgId },
        { type: "OrganizationActivity", id: args.orgId },
      ],
    }),
    transferOrganizationOwner: builder.mutation<OrganizationMember, { orgId: number | string; memberId: number | string }>({
      query: ({ orgId, memberId }) => ({ url: API_ENDPOINTS.organizations.transferOwner(orgId), method: "POST", body: { memberId: Number(memberId) } }),
      transformResponse: (response: { data?: OrganizationMember } | OrganizationMember) => unwrap<OrganizationMember>(response),
      invalidatesTags: (_result, _error, args) => [
        { type: "OrganizationMember", id: args.orgId },
        { type: "OrganizationActivity", id: args.orgId },
        "Organization",
      ],
    }),
    organizationActivity: builder.query<OrganizationActivity[], number | string>({
      query: (orgId) => ({ url: API_ENDPOINTS.organizations.activity(orgId), method: "GET" }),
      transformResponse: (response: { data?: OrganizationActivity[] } | OrganizationActivity[]) =>
        unwrap<OrganizationActivity[]>(response) ?? [],
      providesTags: (_result, _error, orgId) => [{ type: "OrganizationActivity", id: orgId }],
    }),
    acceptOrganizationInvitation: builder.mutation<OrganizationMember, string>({
      query: (token) => ({ url: API_ENDPOINTS.organizations.acceptInvitation(token), method: "POST" }),
      transformResponse: (response: { data?: OrganizationMember } | OrganizationMember) => unwrap<OrganizationMember>(response),
      invalidatesTags: ["Organization"],
    }),
    rejectOrganizationInvitation: builder.mutation<OrganizationInvitation, string>({
      query: (token) => ({ url: API_ENDPOINTS.organizations.rejectInvitation(token), method: "POST" }),
      transformResponse: (response: { data?: OrganizationInvitation } | OrganizationInvitation) => unwrap<OrganizationInvitation>(response),
      invalidatesTags: ["Organization"],
    }),
  }),
});

export const {
  useMyOrganizationsQuery,
  useCreateOrganizationMutation,
  useOrganizationMembersQuery,
  useAddOrganizationMemberMutation,
  useUpdateOrganizationMemberMutation,
  useRemoveOrganizationMemberMutation,
  useOrganizationPropertiesQuery,
  useOrganizationInvitationsQuery,
  useInviteOrganizationMemberMutation,
  useRevokeOrganizationInvitationMutation,
  useTransferOrganizationOwnerMutation,
  useOrganizationActivityQuery,
  useAcceptOrganizationInvitationMutation,
  useRejectOrganizationInvitationMutation,
} = organizationsApi;

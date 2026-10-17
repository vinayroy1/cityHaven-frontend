"use client";

import { createApi } from "@reduxjs/toolkit/query/react";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { baseQueryWithReauth } from "@/lib/api/baseQueryWithReauth";
import type {
  CreateProjectInput,
  ProjectInquiryInput,
  ProjectListing,
  ProjectSearchParams,
  ProjectSearchResponse,
  UpdateProjectInput,
} from "@/types/project.types";

type ApiEnvelope<T> = { success: boolean; data: T; message?: string };

const queryString = (params?: ProjectSearchParams) => {
  const query = new URLSearchParams();
  if (!params) return "";
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") query.set(key, String(value));
  });
  return query.toString();
};

export const projectsApi = createApi({
  reducerPath: "projectsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Project", "ProjectList", "MyProjects"],
  endpoints: (builder) => ({
    searchProjects: builder.query<ProjectSearchResponse, ProjectSearchParams | void>({
      query: (params) => {
        const qs = queryString(params || undefined);
        return { url: `${API_ENDPOINTS.projects.search}${qs ? `?${qs}` : ""}`, method: "GET" };
      },
      transformResponse: (response: ApiEnvelope<ProjectSearchResponse>) => response.data,
      providesTags: ["ProjectList"],
    }),
    getProject: builder.query<ProjectListing, string>({
      query: (slug) => ({ url: API_ENDPOINTS.projects.detail(slug), method: "GET" }),
      transformResponse: (response: ApiEnvelope<ProjectListing>) => response.data,
      providesTags: (_result, _error, slug) => [{ type: "Project", id: slug }],
    }),
    getMyProjects: builder.query<ProjectListing[], void>({
      query: () => ({ url: API_ENDPOINTS.projects.my, method: "GET" }),
      transformResponse: (response: ApiEnvelope<ProjectListing[]>) => response.data || [],
      providesTags: ["MyProjects"],
    }),
    createProject: builder.mutation<ProjectListing, CreateProjectInput>({
      query: (body) => ({ url: API_ENDPOINTS.projects.create, method: "POST", body }),
      transformResponse: (response: ApiEnvelope<ProjectListing>) => response.data,
      invalidatesTags: ["ProjectList", "MyProjects"],
    }),
    updateProject: builder.mutation<ProjectListing, { id: string; data: UpdateProjectInput }>({
      query: ({ id, data }) => ({ url: API_ENDPOINTS.projects.update(id), method: "PATCH", body: data }),
      transformResponse: (response: ApiEnvelope<ProjectListing>) => response.data,
      invalidatesTags: (_result, _error, { id }) => ["ProjectList", "MyProjects", { type: "Project", id }],
    }),
    archiveProject: builder.mutation<void, string>({
      query: (id) => ({ url: API_ENDPOINTS.projects.archive(id), method: "DELETE" }),
      invalidatesTags: ["ProjectList", "MyProjects"],
    }),
    createProjectInquiry: builder.mutation<void, { projectId: string; data: ProjectInquiryInput }>({
      query: ({ projectId, data }) => ({ url: API_ENDPOINTS.projects.inquiry(projectId), method: "POST", body: data }),
    }),
    getProjectMediaUploadUrl: builder.mutation<
      { uploadUrl: string; publicUrl: string; key: string },
      { fileName: string; contentType: string; subFolder: "photos" | "brochures" }
    >({
      query: (body) => ({ url: API_ENDPOINTS.projects.presignMediaUpload, method: "POST", body }),
      transformResponse: (response: ApiEnvelope<{ uploadUrl: string; publicUrl: string; key: string }>) => response.data,
    }),
  }),
});

export const {
  useSearchProjectsQuery,
  useGetProjectQuery,
  useGetMyProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useArchiveProjectMutation,
  useCreateProjectInquiryMutation,
  useGetProjectMediaUploadUrlMutation,
} = projectsApi;

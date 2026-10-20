"use client";

import { createApi } from "@reduxjs/toolkit/query/react";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { baseQueryWithReauth } from "@/lib/api/baseQueryWithReauth";
import type { BlogListResponse, BlogPost, BlogPostInput } from "@/types/blog.types";

type Envelope<T> = { success: boolean; data: T; message?: string };

export const blogApi = createApi({
  reducerPath: "blogApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["BlogPosts", "BlogPost"],
  endpoints: (builder) => ({
    getAdminBlogPosts: builder.query<BlogListResponse, { page?: number; status?: string; q?: string } | void>({
      query: (params) => ({ url: API_ENDPOINTS.blog.adminList, params: params || undefined }),
      transformResponse: (response: Envelope<BlogListResponse>) => response.data,
      providesTags: ["BlogPosts"],
    }),
    getAdminBlogPost: builder.query<BlogPost, number>({
      query: (id) => API_ENDPOINTS.blog.adminPost(id),
      transformResponse: (response: Envelope<BlogPost>) => response.data,
      providesTags: (_result, _error, id) => [{ type: "BlogPost", id }],
    }),
    createBlogPost: builder.mutation<BlogPost, BlogPostInput>({
      query: (body) => ({ url: API_ENDPOINTS.blog.adminCreate, method: "POST", body }),
      transformResponse: (response: Envelope<BlogPost>) => response.data,
      invalidatesTags: ["BlogPosts"],
    }),
    updateBlogPost: builder.mutation<BlogPost, { id: number; data: Partial<BlogPostInput> }>({
      query: ({ id, data }) => ({ url: API_ENDPOINTS.blog.adminPost(id), method: "PATCH", body: data }),
      transformResponse: (response: Envelope<BlogPost>) => response.data,
      invalidatesTags: ["BlogPosts", "BlogPost"],
    }),
    archiveBlogPost: builder.mutation<void, number>({
      query: (id) => ({ url: API_ENDPOINTS.blog.adminPost(id), method: "DELETE" }),
      invalidatesTags: ["BlogPosts"],
    }),
    getBlogMediaUploadUrl: builder.mutation<{ uploadUrl: string; publicUrl: string; key: string }, { fileName: string; contentType: string }>({
      query: (body) => ({ url: API_ENDPOINTS.blog.presignMediaUpload, method: "POST", body }),
      transformResponse: (response: Envelope<{ uploadUrl: string; publicUrl: string; key: string }>) => response.data,
    }),
  }),
});

export const {
  useGetAdminBlogPostsQuery,
  useGetAdminBlogPostQuery,
  useCreateBlogPostMutation,
  useUpdateBlogPostMutation,
  useArchiveBlogPostMutation,
  useGetBlogMediaUploadUrlMutation,
} = blogApi;

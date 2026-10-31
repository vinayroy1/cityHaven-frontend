"use client";

import { createApi } from "@reduxjs/toolkit/query/react";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { baseQueryWithReauth } from "@/lib/api/baseQueryWithReauth";

export type DocumentType =
  | "ID_PROOF"
  | "ADDRESS_PROOF"
  | "OWNERSHIP_PROOF"
  | "RENTAL_AGREEMENT"
  | "OTHER";

export interface PropertyDocumentMeta {
  title?: string;
  status?: "VERIFIED" | "REVIEWING" | "PENDING" | "REJECTED";
  fileSize?: number;
  mimeType?: string;
  storageKey?: string;
  documentNumber?: string;
  notes?: string;
}

export interface PropertyDocument {
  id: number;
  ownerUserId: number;
  propertyId?: number | null;
  type: DocumentType;
  fileUrl: string;
  meta?: PropertyDocumentMeta | null;
  createdAt: string;
  property?: {
    id: number;
    title: string;
    cityName?: string | null;
    locality?: string | null;
    listingType?: string | null;
  } | null;
}

export interface DocumentStats {
  totalDocuments: number;
  ownershipProofs: number;
  verifiedProofs: number;
  inReview: number;
  linkedPropertiesCount: number;
}

export interface GetMyDocumentsParams {
  propertyId?: number;
  type?: DocumentType;
  search?: string;
}

export interface CreateDocumentPayload {
  title: string;
  type: DocumentType;
  fileUrl: string;
  propertyId?: number | null;
  meta?: PropertyDocumentMeta;
}

export const documentsApi = createApi({
  reducerPath: "documentsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Documents", "DocumentStats"],
  endpoints: (builder) => ({
    getMyDocuments: builder.query<PropertyDocument[], GetMyDocumentsParams | void>({
      query: (params) => ({
        url: API_ENDPOINTS.documents.list,
        method: "GET",
        params: params || {},
      }),
      transformResponse: (response: { success?: boolean; data?: PropertyDocument[] } | PropertyDocument[]) => {
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.data)) return response.data;
        return [];
      },
      providesTags: ["Documents"],
    }),

    getDocumentStats: builder.query<DocumentStats, void>({
      query: () => ({
        url: API_ENDPOINTS.documents.stats,
        method: "GET",
      }),
      transformResponse: (response: { success?: boolean; data?: DocumentStats }) =>
        response?.data ?? {
          totalDocuments: 0,
          ownershipProofs: 0,
          verifiedProofs: 0,
          inReview: 0,
          linkedPropertiesCount: 0,
        },
      providesTags: ["DocumentStats"],
    }),

    getPresignedDocUploadUrl: builder.mutation<
      { uploadUrl: string; publicUrl: string; key: string },
      { fileName: string; contentType: string; propertyId?: number | null }
    >({
      query: (body) => ({
        url: API_ENDPOINTS.documents.presignedUrl,
        method: "POST",
        body,
      }),
      transformResponse: (response: { data?: { uploadUrl: string; publicUrl: string; key: string } }) =>
        response?.data as { uploadUrl: string; publicUrl: string; key: string },
    }),

    createDocument: builder.mutation<
      { success: boolean; data: PropertyDocument; message?: string },
      CreateDocumentPayload
    >({
      query: (body) => ({
        url: API_ENDPOINTS.documents.create,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Documents", "DocumentStats"],
    }),

    deleteDocument: builder.mutation<{ success: boolean; message?: string }, number | string>({
      query: (id) => ({
        url: API_ENDPOINTS.documents.delete(id),
        method: "DELETE",
      }),
      invalidatesTags: ["Documents", "DocumentStats"],
    }),

    getDocumentDownloadUrl: builder.query<
      { downloadUrl: string; title: string; mimeType: string },
      number | string
    >({
      query: (id) => ({
        url: API_ENDPOINTS.documents.download(id),
        method: "GET",
      }),
      transformResponse: (response: { data?: { downloadUrl: string; title: string; mimeType: string } }) =>
        response?.data as { downloadUrl: string; title: string; mimeType: string },
    }),
  }),
});

export const {
  useGetMyDocumentsQuery,
  useGetDocumentStatsQuery,
  useGetPresignedDocUploadUrlMutation,
  useCreateDocumentMutation,
  useDeleteDocumentMutation,
  useGetDocumentDownloadUrlQuery,
} = documentsApi;

"use client";

import { createApi } from "@reduxjs/toolkit/query/react";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { baseQueryWithReauth } from "@/lib/api/baseQueryWithReauth";

export interface ApiMessage {
  id: number;
  conversationId: number;
  senderId: number;
  type: string;
  content: string | null;
  attachments?: any;
  sentAt: string;
  readAt?: string | null;
  sender?: {
    id: number;
    name?: string | null;
    profileImage?: string | null;
  };
}

export interface ApiConversationParticipant {
  id: number;
  userId: number;
  role: string;
  user?: {
    id: number;
    name?: string | null;
    mobileNumber?: string | null;
    email?: string | null;
    profileImage?: string | null;
  };
}

export interface ApiConversation {
  id: number;
  propertyId?: number | null;
  type?: string;
  createdById?: number;
  createdAt: string;
  updatedAt: string;
  property?: {
    id: number;
    title?: string | null;
    cityName?: string | null;
    locality?: string | null;
    price?: number | null;
    media?: Array<{ url: string; order?: number }>;
  } | null;
  participants?: ApiConversationParticipant[];
  messages?: ApiMessage[];
}

export interface SendMessagePayload {
  conversationId: number | string;
  content: string;
  type?: string;
  attachments?: any;
}

export interface CreateConversationPayload {
  targetUserId: number;
  propertyId?: number;
  initialMessage?: string;
}

export const messagingApi = createApi({
  reducerPath: "messagingApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Conversations", "Messages"],
  endpoints: (builder) => ({
    getMyConversations: builder.query<ApiConversation[], void>({
      query: () => ({
        url: API_ENDPOINTS.messaging.conversations,
        method: "GET",
      }),
      transformResponse: (response: any) => {
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.data)) return response.data;
        return [];
      },
      providesTags: ["Conversations"],
    }),
    getConversation: builder.query<ApiConversation, number | string>({
      query: (id) => ({
        url: API_ENDPOINTS.messaging.conversation(id),
        method: "GET",
      }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: (_result, _err, id) => [{ type: "Conversations", id }],
    }),
    getMessages: builder.query<ApiMessage[], number | string>({
      query: (conversationId) => ({
        url: API_ENDPOINTS.messaging.messages(conversationId),
        method: "GET",
      }),
      transformResponse: (response: any) => {
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.data)) return response.data;
        return [];
      },
      providesTags: (_result, _err, conversationId) => [{ type: "Messages", id: conversationId }],
    }),
    sendMessage: builder.mutation<ApiMessage, SendMessagePayload>({
      query: ({ conversationId, content, type = "TEXT", attachments }) => ({
        url: API_ENDPOINTS.messaging.messages(conversationId),
        method: "POST",
        body: { content, type, attachments },
      }),
      invalidatesTags: (_result, _err, { conversationId }) => [
        { type: "Messages", id: conversationId },
        "Conversations",
      ],
    }),
    createConversation: builder.mutation<ApiConversation, CreateConversationPayload>({
      query: (body) => ({
        url: API_ENDPOINTS.messaging.conversations,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Conversations"],
    }),
  }),
});

export const {
  useGetMyConversationsQuery,
  useGetConversationQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useCreateConversationMutation,
} = messagingApi;

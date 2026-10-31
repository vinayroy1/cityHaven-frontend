"use client";

import { createApi } from "@reduxjs/toolkit/query/react";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { baseQueryWithReauth } from "@/lib/api/baseQueryWithReauth";

export interface ApiNotification {
  id: number;
  userId: number;
  type: string;
  title: string;
  body: string;
  data?: Record<string, any> | null;
  readAt?: string | null;
  createdAt: string;
}

export const notificationsApi = createApi({
  reducerPath: "notificationsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Notifications"],
  endpoints: (builder) => ({
    getNotifications: builder.query<ApiNotification[], void>({
      query: () => ({
        url: API_ENDPOINTS.notifications.list,
        method: "GET",
      }),
      transformResponse: (response: any) => {
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.data)) return response.data;
        return [];
      },
      providesTags: ["Notifications"],
    }),
    markNotificationRead: builder.mutation<{ success: boolean; data?: any }, number | string>({
      query: (id) => ({
        url: API_ENDPOINTS.notifications.markRead(id),
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications"],
    }),
    markAllNotificationsRead: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: API_ENDPOINTS.notifications.markAllRead,
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationsApi;

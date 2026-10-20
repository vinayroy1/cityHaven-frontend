"use client";

import { configureStore } from "@reduxjs/toolkit";
import { propertyListingReducer, propertyListingApi } from "@/features/propertyListing";
import { authApi } from "@/features/auth/api";
import { contactVerifyApi } from "@/features/contactVerify/api";
import { organizationsApi } from "@/features/organizations/api";
import { advisorsApi } from "@/features/advisors/api";
import { flatmatesApi } from "@/features/flatmates/api";
import { projectsApi } from "@/features/projects/api";
import { blogApi } from "@/features/blog/api";

export const makeStore = () =>
  configureStore({
    reducer: {
      propertyListing: propertyListingReducer,
      [propertyListingApi.reducerPath]: propertyListingApi.reducer,
      [authApi.reducerPath]: authApi.reducer,
      [contactVerifyApi.reducerPath]: contactVerifyApi.reducer,
      [organizationsApi.reducerPath]: organizationsApi.reducer,
      [advisorsApi.reducerPath]: advisorsApi.reducer,
      [flatmatesApi.reducerPath]: flatmatesApi.reducer,
      [projectsApi.reducerPath]: projectsApi.reducer,
      [blogApi.reducerPath]: blogApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        propertyListingApi.middleware,
        authApi.middleware,
        contactVerifyApi.middleware,
        organizationsApi.middleware,
        advisorsApi.middleware,
        flatmatesApi.middleware,
        projectsApi.middleware,
        blogApi.middleware
      ),
    devTools: true,
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export const selectPropertyListing = (state: RootState) => state.propertyListing;

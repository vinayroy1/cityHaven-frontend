"use client";

import { configureStore } from "@reduxjs/toolkit";
import { propertyListingReducer, propertyListingApi } from "@/features/propertyListing";
import { authApi } from "@/features/auth/api";

export const makeStore = () =>
  configureStore({
    reducer: {
      propertyListing: propertyListingReducer,
      [propertyListingApi.reducerPath]: propertyListingApi.reducer,
      [authApi.reducerPath]: authApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(propertyListingApi.middleware, authApi.middleware),
    devTools: true,
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export const selectPropertyListing = (state: RootState) => state.propertyListing;

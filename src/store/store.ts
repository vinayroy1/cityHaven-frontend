"use client";

import { configureStore } from "@reduxjs/toolkit";
import propertyListingReducer from "./propertyListingSlice";
import { propertyListingApi } from "./propertyListingApi";

export const makeStore = () =>
  configureStore({
    reducer: {
      propertyListing: propertyListingReducer,
      [propertyListingApi.reducerPath]: propertyListingApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(propertyListingApi.middleware),
    devTools: true,
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export const selectPropertyListing = (state: RootState) => state.propertyListing;

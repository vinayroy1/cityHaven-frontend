"use client";

import { configureStore } from "@reduxjs/toolkit";
import propertyListingReducer from "./propertyListingSlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      propertyListing: propertyListingReducer,
    },
    devTools: true,
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export const selectPropertyListing = (state: RootState) => state.propertyListing;

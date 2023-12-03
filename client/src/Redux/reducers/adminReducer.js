import { createReducer } from "@reduxjs/toolkit";

export const adminReducer = createReducer(
  {},
  {

    // Add User

    registerRequest: (state) => {
      state.loading = true;
    },
    registerSuccess: (state, action) => {
      state.loading = false;
      state.message = action.payload.message;
    },
    registerFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
  }
);

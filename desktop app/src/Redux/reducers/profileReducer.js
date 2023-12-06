import { createReducer } from "@reduxjs/toolkit";

export const profileReducer = createReducer(
  {},
  {
    // Login

    loginRequest: (state) => {
      state.loading = true;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.message = action.payload.message;
    },
    loginFail: (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.error = action.payload;
    },

    // Logout

    logoutRequest: (state) => {
      state.loading = true;
    },
    logoutSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.message = action.payload;
    },
    logoutFail: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.error = action.payload;
    },

    // Get My Profile(Load User)

    loadUserRequest: (state) => {
      state.loading = true;
    },
    loadUserSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    loadUserFail: (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.error = action.payload;
    },

    // Get Single User

    GetSingleUserRequest: (state) => {
      state.loading = true;
    },
    GetSingleUserSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload;
    },
    GetSingleUserFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Send Message

    SendMessageRequest: (state) => {
      state.loading = true;
    },
    SendMessageSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.messageData = action.payload.messageData;
    },
    SendMessageFail: (state, action) => {
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

export const messageReducer = createReducer(
  { userMessages: [] },
  {
    // Get Messages

    GetMessagesRequest: (state) => {
      state.loading = true;
    },
    GetMessagesSuccess: (state, action) => {
      state.loading = false;
      state.userMessages = action.payload.userMessages;
    },
    GetMessagesFail: (state, action) => {
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

export const updateProfileReducer = createReducer(
  {},
  {
    // Update Profile
    updateProfileRequest: (state) => {
      state.loading = true;
    },
    updateProfileSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.message = action.payload.message;
    },
    updateProfileFail: (state, action) => {
      state.loading = false;
      state.user = null;
      state.error = action.payload;
    },

     // Change Password
     changePasswordRequest: (state) => {
      state.loading = true;
    },
    changePasswordSuccess: (state, action) => {
      state.loading = false;
      state.message = action.payload
    },
    changePasswordFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    //Update Status
    updateStatusRequest: (state) => {
      state.loading = true;
    },
    updateStatusSuccess: (state, action) => {
      state.loading = false;
    },
    updateStatusFail: (state, action) => {
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

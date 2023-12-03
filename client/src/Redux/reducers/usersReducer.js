import { createReducer } from "@reduxjs/toolkit";

export const usersReducer = createReducer(
  { users: [] },
  {

    // All Users
    allUsersRequest: (state) => {
      state.loading = true;
    },
    allUsersSuccess: (state, action) => {
      state.loading = false;
      state.users = action.payload;
    },
    allUsersFail: (state, action) => {
      state.loading = false;
      state.error = action.payload
    },


    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
  }
);

export const usersGroupReducer = createReducer(
  { userGroups: [] },
  {

    //Group Users
    groupUsersRequest: (state) => {
      state.loading = true;
    },
    groupUsersSuccess: (state, action) => {
      state.loading = false;
      state.userGroups = action.payload;
    },
    groupUsersFail: (state, action) => {
      state.loading = false;
      state.error = action.payload
    },


    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
  }
);

export const lastMessageReducer = createReducer(
  { lastMessages: [] },
  {

    // Get All Users Last Message
    lastMessageOfAllUsersRequest: (state) => {
      state.loading = true;
    },
    lastMessageOfAllUsersSuccess: (state, action) => {
      state.loading = false;
      state.lastMessages = action.payload;
    },
    lastMessageOfAllUsersFail: (state, action) => {
      state.loading = false;
      state.error = action.payload
    },





    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
  }
);


export const myLastMessageReducer = createReducer(
  { lastMessages: [] },
  {

    // My Last Messages

    MyLastMessagesRequest: (state) => {
      state.loading = true;
    },
    MyLastMessagesSuccess: (state, action) => {
      state.loading = false;
      state.lastMessages = action.payload
    },
    MyLastMessagesFail: (state, action) => {
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

export const usersCreateGroupReducer = createReducer(
  {},
  {

    //Group Users
    groupCreateRequest: (state) => {
      state.loading = true;
    },
    groupCreateSuccess: (state, action) => {
      state.loading = false;
      state.group = action.payload;
      state.message = action.payload.message;
    },
    groupCreateFail: (state, action) => {
      state.loading = false;
      state.error = action.payload
    },


    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
  }
);

export const groupMemberReducer = createReducer(
  { group: {} },
  {

    //Group Users
    groupMemberRequest: (state) => {
      state.loading = true;
    },
    groupMemberSuccess: (state, action) => {
      state.loading = false;
      state.group = action.payload;
    },
    groupMemberFail: (state, action) => {
      state.loading = false;
      state.error = action.payload
    },


    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
  }
);

export const updateGroupMemberReducer = createReducer(
  {},
  {
    // Update Group Member
    updateGroupMemberRequest: (state) => {
      state.loading = true;
    },
    updateGroupMemberSuccess: (state, action) => {
      state.loading = false;
      state.group = action.payload.group;
      state.message = action.payload.message;
    },
    updateGroupMemberFail: (state, action) => {
      state.loading = false;
      state.group = null;
      state.error = action.payload;
    },

     // Add Group Member
     addGroupMemberRequest: (state) => {
      state.loading = true;
    },
    addGroupMemberSuccess: (state, action) => {
      state.loading = false;
      state.group = action.payload.group;
      state.message = action.payload.message;
    },
    addGroupMemberFail: (state, action) => {
      state.loading = false;
      state.group = null;
      state.error = action.payload;
    },

    // Edit Group Photo & GroupName
    editGroupInfoRequest: (state) => {
      state.loading = true;
    },
    editGroupInfoSuccess: (state, action) => {
      state.loading = false;
      state.group = action.payload.group;
      state.message = action.payload.message;
    },
    editGroupInfoFail: (state, action) => {
      state.loading = false;
      state.group = null;
      state.error = action.payload;
    },

    // Leave Group 
    leaveGroupMemberRequest: (state) => {
      state.loading = true;
    },
    leaveGroupMemberSuccess: (state, action) => {
      state.loading = false;
      state.message = action.payload.message;
    },
    leaveGroupMemberFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    //Make or Remove Admin
    adminGroupRequest: (state) => {
      state.loading = true;
    },
    adminGroupSuccess: (state, action) => {
      state.loading = false;
      state.message = action.payload.message;
    },
    adminGroupFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

     //Delete Group
     deleteGroupRequest: (state) => {
      state.loading = true;
    },
    deleteGroupSuccess: (state, action) => {
      state.loading = false;
      state.message = action.payload.message;
    },
    deleteGroupFail: (state, action) => {
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

export const lastSeenReducer = createReducer(
  { users: [] },
  {

    // Last Seen Users
    lastSeenRequest: (state) => {
      state.loading = true;
    },
    lastSeenSuccess: (state, action) => {
      state.loading = false;
      state.users = action.payload;
    },
    lastSeenFail: (state, action) => {
      state.loading = false;
      state.error = action.payload
    },


    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
  }
);
import { server } from "../store";
import axios from "axios";

// Login
export const login = (email, password) => async (dispatch) => {
  try {
    dispatch({ type: "loginRequest" });

    const { data } = await axios.post(
      `${server}/login`,
      { email, password },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    dispatch({ type: "loginSuccess", payload: data });
  } catch (error) {
    dispatch({ type: "loginFail", payload: error.response.data.message });
  }
};

// Logout
export const logout = () => async (dispatch) => {
  try {
    dispatch({ type: "logoutRequest" });

    const { data } = await axios.get(
      `${server}/logout`,
      {
        withCredentials: true,
      }
    );
    dispatch({ type: "logoutSuccess", payload: data.message });
  } catch (error) {
    dispatch({ type: "logoutFail", payload: error.response.data.message });
  }
};

// Get My Profile
export const loadUser = () => async (dispatch) => {
  try {
    dispatch({ type: "loadUserRequest" });

    const { data } = await axios.get(`${server}/me`, {
      withCredentials: true,
    });
    dispatch({ type: "loadUserSuccess", payload: data.user });
  } catch (error) {
    dispatch({ type: "loadUserFail", payload: error.response.data.message });
  }
};

// All Users
export const allUsers = () => async (dispatch) => {
  try {
    dispatch({ type: "allUsersRequest" });

    const { data } = await axios.get(`${server}/users`, {
      withCredentials: true,
    });
    dispatch({ type: "allUsersSuccess", payload: data.users });
  } catch (error) {
    dispatch({ type: "allUsersFail", payload: error.response.data.message });
  }
};

// Group Users Users
export const groupUsers = () => async (dispatch) => {
  try {
    dispatch({ type: "groupUsersRequest" });

    const { data } = await axios.get(`${server}/users`, {
      withCredentials: true,
    });
    dispatch({ type: "groupUsersSuccess", payload: data.userGroups });
  } catch (error) {
    dispatch({ type: "groupUsersFail", payload: error.response.data.message });
  }
};


// Get Single User
export const singleUser = (userId) => async (dispatch) => {
  try {
    dispatch({ type: "GetSingleUserRequest" });

    const { data } = await axios.get(`${server}/user/${userId}`, {
      withCredentials: true,
    });
    dispatch({ type: "GetSingleUserSuccess", payload: data.user });
  } catch (error) {
    dispatch({ type: "GetSingleUserFail", payload: error.response.data.message });
  }
};

// Send Message
export const sendMessage = (receiver, text) => async (dispatch) => {
  try {
    dispatch({ type: "SendMessageRequest" });

    const { data } = await axios.post(
      `${server}/send`,
      { receiver, text },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    dispatch({ type: "SendMessageSuccess", payload: data });
  } catch (error) {
    dispatch({ type: "SendMessageFail", payload: error.response.data.message });
  }
};

// Get Messages
export const getMessages = (userId) => async (dispatch) => {
  try {
    dispatch({ type: "GetMessagesRequest" });

    const { data } = await axios.get(
      `${server}/message/${userId}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    dispatch({ type: "GetMessagesSuccess", payload: data });
  } catch (error) {
    dispatch({ type: "GetMessagesFail", payload: error.response.data.message });
  }
};

// Get Last Message of All Users
export const lastMessageOfAllUsers = () => async (dispatch) => {
  try {
    dispatch({ type: "lastMessageOfAllUsersRequest" });

    const { data } = await axios.get(`${server}/lastmessages`, {
      withCredentials: true,
    });
    dispatch({ type: "lastMessageOfAllUsersSuccess", payload: data.lastMessages });
  } catch (error) {
    dispatch({ type: "lastMessageOfAllUsersFail", payload: error.response.data.message });
  }
};


// My Last Messages
export const mylastMessages = () => async (dispatch) => {
  try {
    dispatch({ type: "MyLastMessagesRequest" });

    const { data } = await axios.get(`${server}/mylastmessages`, {
      withCredentials: true,
    });
    dispatch({ type: "MyLastMessagesSuccess", payload: data.lastMessages });
  } catch (error) {
    dispatch({ type: "MyLastMessagesFail", payload: error.response.data.message });
  }
};

// Add User -- Admin
export const register = (formdata) => async (dispatch) => {
  try {
    dispatch({ type: "registerRequest" });

    const { data } = await axios.post(
      `${server}/new/user`,
      formdata,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      }
    );
    dispatch({ type: "registerSuccess", payload: data });
    return data
  } catch (error) {
    dispatch({ type: "registerFail", payload: error.response.data.message });
  }
};

// Update Profile
export const editProfile = (formdata) => async (dispatch) => {
  try {
    dispatch({ type: "updateProfileRequest" });

    const { data } = await axios.put(
      `${server}/me/update`,
      formdata,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      }
    );
    dispatch({ type: "updateProfileSuccess", payload: data });
    return data
  } catch (error) {
    dispatch({ type: "updateProfileFail", payload: error.response.data.message });
  }
};

// Change Password
export const changePassword = (oldPassword, newPassword) => async (dispatch) => {
  try {
    dispatch({ type: "changePasswordRequest" });

    const { data } = await axios.put(
      `${server}/password/update`,
      { oldPassword, newPassword },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    dispatch({ type: "changePasswordSuccess", payload: data.message });
    return data
  } catch (error) {
    dispatch({ type: "changePasswordFail", payload: error.response.data.message });
  }
};

//Add Group
export const craeteGroup = (formdata) => async (dispatch) => {
  try {
    dispatch({ type: "groupCreateRequest" });

    const { data } = await axios.post(
      `${server}/create/group`,
      formdata,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      }
    );
    dispatch({ type: "groupCreateSuccess", payload: data });
    return data
  } catch (error) {
    dispatch({ type: "groupCreateFail", payload: error.response.data.message });
  }
};

//Get All Group Members
export const allGroupMembers = (groupId) => async (dispatch) => {
  try {
    dispatch({ type: "groupMemberRequest" });

    const { data } = await axios.get(`${server}/get/group/${groupId}`, {
      withCredentials: true,
    });
    dispatch({ type: "groupMemberSuccess", payload: data });
  } catch (error) {
    dispatch({ type: "groupMemberFail", payload: error.response.data.message });
  }
};

//Update Group Member
export const editGroupMember = (groupId, participants) => async (dispatch) => {
  try {
    dispatch({ type: "updateGroupMemberRequest" });

    const { data } = await axios.put(
      `${server}/remove/member/${groupId}`,
      { participants }, 
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    dispatch({ type: "updateGroupMemberSuccess", payload: data });
    return data;
  } catch (error) {
    dispatch({ type: "updateGroupMemberFail", payload: error.response.data.message });
  }
};

//Add Group Member
export const addGroupMember = (groupId, participants) => async (dispatch) => {
  try {
    dispatch({ type: "addGroupMemberRequest" });

    const { data } = await axios.put(
      `${server}/add/member/${groupId}`,
      { participants }, 
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    dispatch({ type: "addGroupMemberSuccess", payload: data });
    return data;
  } catch (error) {
    dispatch({ type: "addGroupMemberFail", payload: error.response.data.message });
  }
};

// Update GroupInfo
export const editGroupInfo = (formdata, groupId) => async (dispatch) => {
  try {
    dispatch({ type: "editGroupInfoRequest" });

    const { data } = await axios.put(
      `${server}/update/group/${groupId}`,
      formdata,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      }
    );
    dispatch({ type: "editGroupInfoSuccess", payload: data });
    return data
  } catch (error) {
    dispatch({ type: "editGroupInfoFail", payload: error.response.data.message });
  }
};

//Leave Group 
export const leaveGroup = (groupId) => async (dispatch) => {
  try {
    dispatch({ type: "leaveGroupMemberRequest" });

    const { data } = await axios.put(
      `${server}/leave/group/${groupId}`, {},
      {
        withCredentials: true,
      }
    );
    dispatch({ type: "leaveGroupMemberSuccess", payload: data });
    return data;
  } catch (error) {
    dispatch({ type: "leaveGroupMemberFail", payload: error.response.data.message });
  }
};

//Make & Remove Admin
export const groupAdminInfo = (groupId, newAdminUserId) => async (dispatch) => {
  try {
    dispatch({ type: "adminGroupRequest" });

    const { data } = await axios.put(
      `${server}/add/group/admin/${groupId}`, {newAdminUserId},
      {
        withCredentials: true,
      }
    );
    dispatch({ type: "adminGroupSuccess", payload: data });
    return data;
  } catch (error) {
    dispatch({ type: "adminGroupFail", payload: error.response.data.message });
  }
};

//Delete Group
export const deleteGroup = (groupId) => async (dispatch) => {
  try {
    dispatch({ type: "deleteGroupRequest" });

    const { data } = await axios.delete(
      `${server}/delete/group/${groupId}`,
      {
        withCredentials: true,
      }
    );
    dispatch({ type: "deleteGroupSuccess", payload: data });
    return data;
  } catch (error) {
    dispatch({ type: "deleteGroupFail", payload: error.response.data.message });
  }
};

//Update User Status
export const updateUserStatus = (lastSeen) => async (dispatch) => {
  try {
    dispatch({ type: "updateStatusRequest" });

    const { data } = await axios.put(
      `${server}/lastseen/update`, {lastSeen},
      {
        withCredentials: true,
      }
    );
    dispatch({ type: "updateStatusSuccess", payload: data });
    return data;
  } catch (error) {
    dispatch({ type: "updateStatusFail", payload: error.response.data });
  }
};

//Last Seen Users
export const lastSeenUsers = () => async (dispatch) => {
  try {
    dispatch({ type: "lastSeenRequest" });

    const { data } = await axios.get(`${server}/get/lastseen`, {
      withCredentials: true,
    });
    dispatch({ type: "lastSeenSuccess", payload: data.users });
  } catch (error) {
    dispatch({ type: "lastSeenFail", payload: error.response.data.message });
  }
};
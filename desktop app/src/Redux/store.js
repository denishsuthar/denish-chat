import { configureStore } from "@reduxjs/toolkit";
import { profileReducer, updateProfileReducer } from "./reducers/profileReducer";
import { groupMemberReducer, lastMessageReducer, lastSeenReducer, myLastMessageReducer, updateGroupMemberReducer, usersCreateGroupReducer, usersGroupReducer, usersReducer } from "./reducers/usersReducer";
import { messageReducer } from "./reducers/profileReducer";
import { adminReducer } from "./reducers/adminReducer";


const store = configureStore({
    reducer:{
       profile:profileReducer,
       users:usersReducer,
       messages:messageReducer,
       lastMessages:lastMessageReducer,
       myLastMessageReducer:myLastMessageReducer,
       addUser:adminReducer,
       updateProfile:updateProfileReducer,
       usersGroup: usersGroupReducer,
       createGroup: usersCreateGroupReducer,
       groupMemberReducer: groupMemberReducer,
       updateGroupMember: updateGroupMemberReducer,
       lastSeenUsers: lastSeenReducer
    }
});


export default store

export const server = process.env.REACT_APP_SERVER_URL_API

export const serverSocket = process.env.REACT_APP_SERVER_URL
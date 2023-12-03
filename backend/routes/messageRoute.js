import express from "express";
import { isAuthenticatedUser } from "../middelware/auth.js";
import { addParticipantsToGroup, clearChat, createGroup, createGroupMessage, createMessage, deleteGroup, getGroup, getGroupMessages, getLatestMessage, getMessagesById, getMyGroups, lastMessageOfAllUsers, leaveGroup, makeAdminInGroup, myLastMessage, removeParticipantsFromGroup, updateGroup } from "../controllers/messageController.js";
import singleUpload from "../middelware/multer.js";


const router = express.Router();

router.route("/send").post(isAuthenticatedUser, createMessage)

router.route("/message/:id").get(isAuthenticatedUser, getMessagesById)

router.route("/latest/message/:id").get(isAuthenticatedUser, getLatestMessage)

router.route("/lastmessages").get(isAuthenticatedUser, lastMessageOfAllUsers)

router.route("/mylastmessages").get(isAuthenticatedUser, myLastMessage)

router.route("/clearchat/:id").delete(isAuthenticatedUser, clearChat)

router.route("/create/group").post(singleUpload,isAuthenticatedUser, createGroup)

router.route("/get/group/:id").get(isAuthenticatedUser, getGroup)

router.route("/mygroups").get(isAuthenticatedUser, getMyGroups)

router.route("/send/message/group").post(isAuthenticatedUser, createGroupMessage)

router.route("/message/group/:id").get(isAuthenticatedUser, getGroupMessages)

router.route("/add/member/:id").put(isAuthenticatedUser, addParticipantsToGroup)

router.route("/remove/member/:id").put(isAuthenticatedUser, removeParticipantsFromGroup)

router.route("/update/group/:id").put(singleUpload, isAuthenticatedUser, updateGroup)

router.route("/leave/group/:id").put(isAuthenticatedUser, leaveGroup)

router.route("/add/group/admin/:id").put(isAuthenticatedUser, makeAdminInGroup)

router.route("/delete/group/:id").delete(isAuthenticatedUser, deleteGroup)





export default router
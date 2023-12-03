import express from "express";
import { allUsers, deleteUser, lastSeenUsers, login, logout, myProfile, register, updateLastSeen, updatePassword, updateProfile, userById } from "../controllers/userController.js";
import { isAdmin, isAuthenticatedUser } from "../middelware/auth.js";
import singleUpload from "../middelware/multer.js"

const router = express.Router();

router.route("/new/user").post(singleUpload, isAuthenticatedUser, isAdmin, register)

router.route("/login").post(login)

router.route("/logout").get(logout)

router.route("/me").get(isAuthenticatedUser, myProfile)

router.route("/users").get(isAuthenticatedUser, allUsers)

router.route("/user/:id").get(isAuthenticatedUser, userById)

router.route("/delete/:id").delete(isAuthenticatedUser, isAdmin, deleteUser)

router.route("/me/update").put(singleUpload, isAuthenticatedUser, updateProfile)

router.route("/password/update").put(isAuthenticatedUser, updatePassword)

router.route("/lastseen/update").put(isAuthenticatedUser, updateLastSeen)

router.route("/get/lastseen").get(isAuthenticatedUser, lastSeenUsers)




export default router
import catchAsyncError from "../middelware/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import { User } from "../models/userModel.js";
import sendToken from "../utils/sendToken.js";
import cloudinary from "cloudinary";
import getDataUri from "../utils/dataUri.js";
import { Group } from "../models/groupModel.js";
import { socketIo } from "../server.js";
import cron from 'node-cron';

// // Login
// export const login = catchAsyncError(async (req, res, next) => {
//   const { email, password } = req.body;
//   if (!email || !password)
//     return next(new ErrorHandler("all Field Required", 400));

//   const user = await User.findOne({ email }).select("+password");
//   if (!user) return next(new ErrorHandler("Invalid Credentials", 401));

//   const isMatch = await user.comparePassword(password);
//   if (!isMatch) return next(new ErrorHandler("Incorrect Password", 401));

//   user.lastSeen = 'Online';
//   await user.save();

//   user.password = undefined;

//   sendToken(res, user, `Welcome Back ${user.name}`, 200);
// });

// Login
export const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new ErrorHandler("all Field Required", 400));

  let isEmail = false;
  let isMobileNumber = false;

  if (email.includes("@" && ".")) {
    isEmail = true;
  } else {
    isMobileNumber = true;
  }

  const query = {
    $or: [
      { email: isEmail ? email : null },
      { mobileNumber: isMobileNumber ? email : null },
    ],
  };

  const user = await User.findOne(query).select("+password");

  if (!user) {
    if (isEmail) {
      return next(new ErrorHandler("Incorrect Email", 400));
    } else {
      return next(new ErrorHandler("Incorrect Mobile", 400));
    }
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return next(new ErrorHandler("Incorrect Password", 401));

  user.lastSeen = "Online";
  await user.save();

  user.password = undefined;

  sendToken(res, user, `Welcome Back ${user.name}`, 200);
});

// Logout
export const logout = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })
    .json({
      success: true,
      message: "Logout SuccessFully",
    });
});

// My Profile
export const myProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    user,
  });
});

// // All Users
// export const allUsers = catchAsyncError(async (req, res, next) => {
//   const loggedInUserId = req.user.id;
//   const users = await User.find({ _id: { $ne: loggedInUserId } });
//   res.status(200).json({
//     success: true,
//     users,
//   });
// });

// All Users with User's Groups
export const allUsers = catchAsyncError(async (req, res, next) => {
  const loggedInUserId = req.user.id;
  const users = await User.find({ _id: { $ne: loggedInUserId } });

  const userGroups = await Group.find({
    participants: loggedInUserId,
  }).populate("participants", "name");

  res.status(200).json({
    success: true,
    users,
    userGroups,
  });
});

// User By ID
export const userById = catchAsyncError(async (req, res, next) => {
  const userId = req.params.id;
  const user = await User.findById(userId);
  res.status(200).json({
    success: true,
    user,
  });
});

// Delete User -- Admin
export const deleteUser = catchAsyncError(async (req, res, next) => {
  const userId = req.params.id;
  const user = await User.findById(userId);
  if (!user) return next(new ErrorHandler("User Not Found", 404));

  await Group.updateMany(
    { $or: [{ participants: userId }, { groupAdmin: userId }] },
    { $pull: { participants: userId, groupAdmin: userId } }
  );

  await user.deleteOne();

  socketIo.emit("DeleteUser", { user });

  res.status(200).json({
    success: true,
    message: "User Deleted Successfully",
  });
});

// Create User -- Admin
export const register = catchAsyncError(async (req, res, next) => {
  const { name, email, password, mobileNumber } = req.body;
  const file = req.file;

  if (!name || !email || !password || !mobileNumber) {
    return next(new ErrorHandler("All fields are required", 400));
  }

  let user = await User.findOne({ email });
  if (user) {
    return next(new ErrorHandler("User Exists", 400));
  }

  let existingUserWithMobile = await User.findOne({ mobileNumber });
  if (existingUserWithMobile)
    return next(new ErrorHandler("Mobile Number Already Used", 400));

  let avatar = {};
  if (file) {
    const fileUri = getDataUri(file);
    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content, {
      folder: "chatapp-users-avatars",
    });

    avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  } else {
    avatar = {
      public_id: "default_avatar_public_id",
      url: process.env.DEFAULT_AVATAR_URL,
    };
  }

  user = await User.create({
    name,
    email,
    password,
    mobileNumber,
    avatar: avatar,
  });

  user.password = undefined;

  socketIo.emit("AddUser", { user });

  res.status(201).json({
    success: true,
    user,
    message: "User Created Successfully",
  });
});

// Update Profile
export const updateProfile = catchAsyncError(async (req, res, next) => {
  const { name } = req.body;
  const file = req.file;

  const user = await User.findById(req.user.id);

  if (name) user.name = name;
  if (file) {
    const fileUri = getDataUri(file);
    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content, {
      folder: "chatapp-users-avatars",
    });
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    user.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }

  await user.save();

  socketIo.emit("AddUser", { user });

  res.status(200).json({
    success: true,
    message: "Profile Updated Successfully",
    user,
  });
});

// Update Password
export const updatePassword = catchAsyncError(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword)
    return next(new ErrorHandler("Please Fill All Fields", 400));

  const user = await User.findById(req.user.id).select("+password");

  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) return next(new ErrorHandler("Old Password Incorrect", 400));

  user.password = newPassword;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password Changed Successfully",
  });
});

// Update Last Seen
export const updateLastSeen = catchAsyncError(async (req, res, next) => {
  const { lastSeen } = req.body;
  const user = await User.findById(req.user.id);
  if (lastSeen) user.lastSeen = lastSeen;

  await user.save();

  socketIo.emit("Lastseen", { lastSeen });

  res.status(200).json({
    success: true,
  });
});

// Get Users Last Seen
export const lastSeenUsers = catchAsyncError(async (req, res, next) => {
  const loggedInUserId = req.user.id;
  const users = await User.find({ _id: { $ne: loggedInUserId } }).select(
    "name lastSeen"
  );

  res.status(200).json({
    success: true,
    users,
  });
});


cron.schedule('*/30 * * * *', async () => {
  const fifteenMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  
  try {
    const usersToSetOffline = await User.find({
      lastSeen: 'Online',
      updatedAt: { $lt: fifteenMinutesAgo },
    });
    await Promise.all(usersToSetOffline.map(async (user) => {
      user.lastSeen = new Date()
      await user.save();
    }));
  } catch (error) {
    console.error('Error updating users:', error);
  }
});
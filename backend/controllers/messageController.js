import catchAsyncError from "../middelware/catchAsyncError.js";
import { GroupMessage } from "../models/groupMessage.js";
import { Group } from "../models/groupModel.js";
import { Message } from "../models/messageModel.js";
import { User } from "../models/userModel.js";
import { socketIo } from "../server.js";
import getDataUri from "../utils/dataUri.js";
import ErrorHandler from "../utils/errorHandler.js";
import cloudinary from "cloudinary";

// Create Message
export const createMessage = catchAsyncError(async (req, res, next) => {
  const { receiver, text } = req.body;
  if (!receiver || !text)
    return next(new ErrorHandler("Please Enter All Field", 400));

  const sender = await User.findById(req.user.id);

  const messageData = await Message.create({
    sender,
    receiver,
    text,
  });

  socketIo.emit("Messages", { messageData });

  res.status(201).json({
    success: true,
    messageData,
  });
});

// // Get Messages
// export const getMessagesById = catchAsyncError(async (req, res, next) => {
//   const senderId = req.user.id;
//   const receiverId = req.params.id;
//   const userMessages = await Message.find({
//     $or: [
//       { sender: senderId, receiver: receiverId },
//       { sender: receiverId, receiver: senderId },
//     ],
//   })
//     .populate("sender", "name")
//     .populate("receiver", "name")
//     .exec();

//   res.status(200).json({
//     success: true,
//     userMessages,
//   });
// });

// Get Messages
export const getMessagesById = catchAsyncError(async (req, res, next) => {
  const senderId = req.user.id;
  const receiverId = req.params.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || process.env.USERS_MESSAGE_LIMIT;

  const messagesToSkip = (page - 1) * limit;

  const userMessages = await Message.find({
    $or: [
      { sender: senderId, receiver: receiverId },
      { sender: receiverId, receiver: senderId },
    ],
  }).sort({ _id: -1 })
    .skip(messagesToSkip)
    .limit(limit)
    .populate("sender", "name")
    .populate("receiver", "name")
    .exec();

  const totalCount = await Message.countDocuments({
    $or: [
      { sender: senderId, receiver: receiverId },
      { sender: receiverId, receiver: senderId },
    ],
  });

  res.status(200).json({
    success: true,
    userMessages,
    totalCount,
    currentPage: page,
    totalPages: Math.ceil(totalCount / limit),
  });
});

// Get the latest message
export const getLatestMessage = catchAsyncError(async (req, res, next) => {
  const senderId = req.user.id;
  const receiverId = req.params.id;
  const latestMessage = await Message.find({
    $or: [
      { sender: senderId, receiver: receiverId },
      { sender: receiverId, receiver: senderId },
    ],
  })
    .sort({ createdAt: -1 })
    .limit(1)
    .populate("sender", "name")
    .populate("receiver", "name avatar")
    .exec();
  res.status(200).json({
    success: true,
    latestMessage,
  });
});

// Get Last Message of All User
export const lastMessageOfAllUsers = catchAsyncError(async (req, res, next) => {
  const users = await User.find();

  const lastMessages = await Promise.all(
    users.map(async (user) => {
      const lastMessage = await Message.findOne({
        $or: [{ sender: user._id }, { receiver: user._id }],
      })
        .sort({ createdAt: -1 })
        .populate("sender", "name")
        .populate("receiver", "name")
        .exec();

      return { user, lastMessage };
    })
  );

  res.status(200).json({
    success: true,
    lastMessages,
  });
});

// // My Last Message
// export const myLastMessage = catchAsyncError(async (req, res, next) => {
//   const userId = req.user.id;

//   const users = await User.find({ _id: { $ne: userId } });

//   const lastMessages = [];

//   for (const user of users) {
//     const lastMessage = await Message.findOne({
//       $or: [
//         { sender: userId, receiver: user._id },
//         { sender: user._id, receiver: userId },
//       ],
//     })
//       .sort({ createdAt: -1 })
//       .populate("sender", "name")
//       .populate("receiver", "name")
//       .exec();

//     if (lastMessage) {
//       lastMessages.push({ user, lastMessage });
//     }
//   }

//   res.status(200).json({
//     success: true,
//     lastMessages,
//   });
// });

// My Last Message with Group Messages
export const myLastMessage = catchAsyncError(async (req, res, next) => {
  const userId = req.user.id;

  const users = await User.find({ _id: { $ne: userId } });
  const userGroups = await Group.find({ participants: userId });

  const lastMessages = [];

  // Fetch the last message for each user
  for (const user of users) {
    const lastMessage = await Message.findOne({
      $or: [
        { sender: userId, receiver: user._id },
        { sender: user._id, receiver: userId },
      ],
    })
      .sort({ createdAt: -1 })
      .populate("sender", "name")
      .populate("receiver", "name")
      .exec();

    if (lastMessage) {
      lastMessages.push({ user, lastMessage });
    }
  }

  // Fetch the last group message for each group
  for (const group of userGroups) {
    const lastGroupMessage = await GroupMessage.findOne({ groupId: group._id })
      .sort({ createdAt: -1 })
      .populate("sender", "name")
      .exec();

    if (lastGroupMessage) {
      lastMessages.push({ group, lastGroupMessage });
    }
  }

  res.status(200).json({
    success: true,
    lastMessages,
  });
});



// Clear Chat Messages
export const clearChat = catchAsyncError(async (req, res, next) => {
  const me = req.user.id;
  const userId = req.params.id;

  await Message.deleteMany({
    $or: [
      { sender: me, receiver: userId },
      { sender: userId, receiver: me },
    ],
  });

  res.status(200).json({
    success: true,
    message: "Chat Messages have been Cleared",
  });
});

// Create Group
export const createGroup = catchAsyncError(async (req, res, next) => {
  const { groupName, participants } = req.body;
  const file = req.file;

  if (!groupName || !participants) {
    return next(new ErrorHandler("All fields are required", 400));
  }

  let groupAvatar = {};
  if (file) {
    const fileUri = getDataUri(file);
    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content, {
      folder: "chatapp-users-avatars",
    });

    groupAvatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  } else {
    groupAvatar = {
      public_id: "default_avatar_public_id",
      url: process.env.DEFAULT_GROUP_AVATAR_URL,
    };
  }

  participants.push(req.user.id);

  let group = await Group.create({
    groupName,
    participants,
    groupAvatar,
    groupAdmin: req.user.id,
  });

  socketIo.emit("AddGroup", { group });

  res.status(201).json({
    success: true,
    group,
    message: "Group Created Successfully",
  });
});

// Get Group Details
export const getGroup = catchAsyncError(async (req, res, next) => {
  const groupId = req.params.id;
  const userId = req.user.id.toString();

  const group = await Group.findById(groupId).populate("participants groupAdmin", "name avatar");
  if (!group) return next(new ErrorHandler("Group Not Found", 404));

  const participants = group.participants.map((participant) => participant._id.toString());
  if (!participants.includes(userId)) {
    return next(new ErrorHandler("You are not a participant of this group", 403));
  }

  res.status(200).json({
    success: true,
    group
  })
})

// Get Groups which has loggedIn User is Included
export const getMyGroups = catchAsyncError(async (req, res, next) => {
  const userId = req.user.id;
  const groups = await Group.find({ participants: userId });
  if (!groups) return next(new ErrorHandler("No Groups Found", 404));

  res.status(200).json({
    success: true,
    groups
  })
})

// Create Group Message
export const createGroupMessage = catchAsyncError(async (req, res, next) => {
  const { groupId, groupName, text } = req.body;

  if (!groupId || !text || !groupName)
    return next(new ErrorHandler("Please Enter All Field", 400));

  const sender = await User.findById(req.user.id);

  const group = await Group.findById(groupId);
  if (!group) return next(new ErrorHandler("Invalid Group", 400))

  const groupMessage = new GroupMessage({
    groupId,
    groupName,
    sender,
    text,
  });

  groupMessage.receivers = group.participants;

  await groupMessage.save();

  socketIo.emit("GroupMessages", { groupMessage });

  res.status(201).json({
    success: true,
    groupMessage,
  });
});


// // Get Group Messages
// export const getGroupMessages = catchAsyncError(async (req, res, next) => {
//   const groupId = req.params.id;
//   const userId = req.user.id;

//   const group = await Group.findById(groupId);
//   if (!group) {
//     return next(new ErrorHandler("Invalid Group", 400));
//   }

//   if (!group.participants.includes(userId)) {
//     return next(new ErrorHandler("You are not a participant of this group", 403));
//   }

//   const groupMessages = await GroupMessage.find({ groupId })
//     .populate("sender", "name avatar")
//     .sort({ createdAt: 1 })
//     .exec();

//   res.status(200).json({
//     success: true,
//     groupMessages,
//   });
// });

// // Get Group Messages
export const getGroupMessages = catchAsyncError(async (req, res, next) => {
  const groupId = req.params.id;
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || process.env.GROUP_MESSAGE_LIMIT;

  const group = await Group.findById(groupId);
  if (!group) {
    return next(new ErrorHandler("Invalid Group", 400));
  }

  if (!group.participants.includes(userId)) {
    return next(new ErrorHandler("You are not a participant of this group", 403));
  }

  const totalCount = await GroupMessage.countDocuments({ groupId });

  const messagesToSkip = (page - 1) * limit;

  const groupMessages = await GroupMessage.find({ groupId })
    .populate("sender", "name avatar")
    .sort({ createdAt: -1 })
    .skip(messagesToSkip)
    .limit(limit)
    .exec();

  res.status(200).json({
    success: true,
    groupMessages,
    totalCount,
    currentPage: page,
    totalPages: Math.ceil(totalCount / limit),
  });
});


// Add Participants to Group
export const addParticipantsToGroup = catchAsyncError(async (req, res, next) => {
  const groupId = req.params.id;
  const { participants } = req.body;
  const userId = req.user.id;

  if (!groupId || !participants || !Array.isArray(participants)) {
    return next(new ErrorHandler("Invalid input data", 400));
  }

  const group = await Group.findById(groupId);
  if (!group) {
    return next(new ErrorHandler("Group not found", 404));
  }

  const isAdmin = group.groupAdmin.some((adminId) => adminId.toString() === userId);
  if (!isAdmin) {
    return next(new ErrorHandler("Only group admin(s) can add participants", 403));
  }

  const participantsToAdd = participants.filter((participant) => {
    return !group.participants.includes(participant);
  });

  if (participantsToAdd.length === 0) {
    return next(new ErrorHandler("This User is already in the group", 400));
  }

  group.participants.push(...participantsToAdd);
  await group.save();

  socketIo.emit("AddGroup", { group });

  res.status(200).json({
    success: true,
    group,
    message: "Participants added to the group successfully",
  });
});

// Remove Participants from Group
export const removeParticipantsFromGroup = catchAsyncError(async (req, res, next) => {
  const groupId = req.params.id;
  const { participants } = req.body;
  const userId = req.user.id;

  if (!groupId || !participants || !Array.isArray(participants)) {
    return next(new ErrorHandler("Invalid input data", 400));
  }

  const group = await Group.findById(groupId);
  if (!group) {
    return next(new ErrorHandler("Group not found", 404));
  }
  const isAdmin = group.groupAdmin.some((adminId) => adminId.toString() === userId);
  if (!isAdmin) {
    return next(new ErrorHandler("Only group admin(s) can add participants", 403));
  }

  const participantsToRemove = participants.filter((participant) => {
    return group.participants.includes(participant);
  });

  if (participantsToRemove.length === 0) {
    return next(new ErrorHandler("These users are not in the group", 400));
  }

  participantsToRemove.forEach((participant) => {
    const index = group.participants.indexOf(participant);
    if (index !== -1) {
      group.participants.splice(index, 1);
    }
  });

  await group.save();

  socketIo.emit("AddGroup", { group });

  res.status(200).json({
    success: true,
    group,
    message: "Participants removed from the group successfully",
  });
});


// Update Group Details
export const updateGroup = catchAsyncError(async (req, res, next) => {
  const { groupName } = req.body
  const file = req.file
  const userId = req.user.id;

  const group = await Group.findById(req.params.id);

  if (!group) {
    return next(new ErrorHandler("Group not found", 404));
  }

  if (!group.participants.includes(userId)) {
    return next(new ErrorHandler("You are not a participant of this group", 403));
  }

  if (groupName) group.groupName = groupName;
  if (file) {
    const fileUri = getDataUri(file);
    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content, {
      folder: "chatapp-users-avatars",
    });
    await cloudinary.v2.uploader.destroy(group.groupAvatar.public_id);
    group.groupAvatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }

  await group.save();

  socketIo.emit("AddGroup", { group });

  res.status(200).json({
    success: true,
    message: "Group Updated Successfully",
    group
  })
})

// Leave Group
export const leaveGroup = catchAsyncError(async (req, res, next) => {
  const groupId = req.params.id;
  const userId = req.user.id;

  const group = await Group.findById(groupId);
  if (!group) {
    return next(new ErrorHandler("Group not found", 404));
  }

  const participantIndex = group.participants.indexOf(userId);
  if (participantIndex === -1) {
    return next(new ErrorHandler("You are not a participant of this group", 403));
  }

  group.participants.splice(participantIndex, 1);

  const isAdmin = group.groupAdmin.some((adminId) => adminId.toString() === userId);
  if (isAdmin) {
    const adminIndex = group.groupAdmin.indexOf(userId);
    group.groupAdmin.splice(adminIndex, 1);
  }

  await group.save();

  socketIo.emit("GroupLeave", { group });

  res.status(200).json({
    success: true,
    message: "You have left the group successfully",
  });
});

// // Make Another User Admin in Group
// export const makeAdminInGroup = catchAsyncError(async (req, res, next) => {
//   const groupId = req.params.id;
//   const { newAdminUserId } = req.body;
//   const userId = req.user.id;

//   const group = await Group.findById(groupId);
//   if (!group) {
//     return next(new ErrorHandler("Group not found", 404));
//   }

//   const isAdmin = group.groupAdmin.some((adminId) => adminId.toString() === userId);
//   if (!isAdmin) {
//     return next(new ErrorHandler("Only group admin can perform this action", 403));
//   }

//   const userIndex = group.participants.indexOf(newAdminUserId);
//   if (userIndex === -1) {
//     return next(new ErrorHandler("Specified user is not a participant of this group", 400));
//   }

//   const adminIndex = group.groupAdmin.indexOf(newAdminUserId);

//   if (adminIndex !== -1) {
//     group.groupAdmin.splice(adminIndex, 1);
//     await group.save();

//     res.status(200).json({
//       success: true,
//       message: "User has been removed as an admin in the group",
//     });
//   } else {
//     group.groupAdmin.push(newAdminUserId);
//     await group.save();

//     res.status(200).json({
//       success: true,
//       message: "User has been made an admin in the group",
//     });
//   }
// });

// Make Another User Admin in Group
export const makeAdminInGroup = catchAsyncError(async (req, res, next) => {
  const groupId = req.params.id;
  const { newAdminUserId } = req.body;
  const userId = req.user.id;

  const group = await Group.findById(groupId);
  if (!group) {
    return next(new ErrorHandler("Group not found", 404));
  }

  const isAdmin = group.groupAdmin.some((adminId) => adminId.toString() === userId);
  if (!isAdmin) {
    return next(new ErrorHandler("Only group admin can perform this action", 403));
  }

  const userIndex = group.participants.indexOf(newAdminUserId);
  if (userIndex === -1) {
    return next(new ErrorHandler("Specified user is not a participant of this group", 400));
  }

  const adminIndex = group.groupAdmin.indexOf(newAdminUserId);

  if (adminIndex !== -1 && userId === newAdminUserId) {
    return next(new ErrorHandler("You Can't Remove Your Self as Admin", 403));
  }

  if (adminIndex !== -1) {
    group.groupAdmin.splice(adminIndex, 1);
    await group.save();

    socketIo.emit("GroupAdmin", { group });

    res.status(200).json({
      success: true,
      message: "User has been removed as an admin in the group",
    });
  } else {
    group.groupAdmin.push(newAdminUserId);
    await group.save();

    socketIo.emit("GroupAdmin", { group });

    res.status(200).json({
      success: true,
      message: "User has been made an admin in the group",
    });
  }
});

// Delete Group -- Group Admin
export const deleteGroup = catchAsyncError(async (req, res, next) => {
  const groupId = req.params.id;
  const userId = req.user.id

  const group = await Group.findById(groupId);
  if (!group) return next(new ErrorHandler("Group Not Found", 404));

  const isAdmin = group.groupAdmin.some((adminId) => adminId.toString() === userId);
  if (!isAdmin) {
    return next(new ErrorHandler("Only group admin can perform this action", 403));
  }

  await GroupMessage.deleteMany({ groupId });

  await cloudinary.v2.uploader.destroy(group.groupAvatar.public_id);

  await group.deleteOne();

  socketIo.emit("DeleteGroup", { group });

  res.status(200).json({
    success: true,
    message: "Group Deleted Successfully"
  })
})








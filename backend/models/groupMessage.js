import mongoose from "mongoose";

const groupMessageSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.ObjectId,
    ref: "Group",
    required: true,
  },
  groupName:{
    type:String,
  },
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  receivers: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User"
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const GroupMessage = mongoose.model("GroupMessage", groupMessageSchema);

import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
  groupName: {
    type: String,
    required: [true, "Please Enter Group Name"],
  },
  groupAvatar: {
    public_id: {
      type: String,
    },
    url: {
      type: String,
    },
  },
  participants: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  groupAdmin: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Group = mongoose.model("Group", groupSchema);

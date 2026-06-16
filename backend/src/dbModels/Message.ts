import mongoose, { Schema } from "mongoose";
import type { IMessage } from "@/types/message.types";

const MessageSchema = new mongoose.Schema<IMessage>(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: [true, "The room id is required"],
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "The sender is required"],
    },
    readBy: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      required: [true, "The readBy is required"],
    },
    edited: {
      type: Boolean,
      required: [true, "The edited is required"],
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const MessageModel = mongoose.model<IMessage>("Message", MessageSchema);

export default MessageModel;

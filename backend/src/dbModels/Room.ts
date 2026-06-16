import mongoose, { Schema } from "mongoose";
import type { IRoom } from "@/types/message.types";

const RoomSchema = new mongoose.Schema<IRoom>(
  {
    name: String,
    members: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      required: true,
      default: [],
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    admin: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isDirect: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const RoomModel = mongoose.model<IRoom>("Room", RoomSchema);

export default RoomModel;

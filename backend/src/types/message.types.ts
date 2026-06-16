import { Types } from "mongoose";

export interface IMessage {
  roomId: Types.ObjectId;
  senderId: Types.ObjectId;
  content: string;
  readBy: Types.ObjectId[];
  edited: Boolean;
  createdAt: Date;
}

export interface IRoom {
  name: string;
  members: Types.ObjectId[];
  lastMessage: Types.ObjectId;
  admin: Types.ObjectId;
  isDirect: boolean;
}

export interface MessageDTO {
  roomId: string;
  senderId: {};
  content: string;
}

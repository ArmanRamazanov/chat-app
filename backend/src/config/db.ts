import type {
  loginInput,
  registerInput,
  User,
  userWithoutPassword,
} from "@/types/register.types";
import UserModel from "@/models/User";
import { customError } from "@/utils/customError";
import bcrypt from "bcryptjs";
import {
  generateAccessToken,
  generateRefreshToken,
} from "@/utils/tokenGeneration";
import mongoose, { MongooseError, Types } from "mongoose";
import RoomModel from "@/models/Room";
import MessageModel from "@/models/Message";
import type { createRoomInput, IRoom, MessageDTO } from "@/types/message.types";

class RegistrationDB {
  async register(
    input: registerInput,
  ): Promise<{ accessToken: string; user: userWithoutPassword }> {
    const { username, password, firstName } = input;

    const newUser = {
      username,
      password,
      profile: {
        firstName,
        surname: null,
        bio: null,
      },
    };

    try {
      const user = await UserModel.create(newUser);

      const { password, ...userWithoutPassword } = user.toObject();
      const accessToken = generateAccessToken(user.id, user.role);
      return { accessToken, user: userWithoutPassword };
    } catch (err: any) {
      if ("code" in err) {
        if (err.code === 11000) {
          const duplicateField = Object.keys(err.keyValue)[0];
          throw new customError(
            409,
            `The field ${duplicateField} already exists. Please use a different one.`,
            null,
          );
        }
      }
      if (err instanceof mongoose.Error.ValidationError) {
        const errorDetails = Object.values(err.errors).map(
          (validationError) => ({
            field: validationError.path,
            message: validationError.message,
          }),
        );

        throw new customError(400, "", errorDetails);
      }
      if (err instanceof mongoose.Error.CastError) {
        throw new customError(400, "", [
          { field: err.path, message: err.message },
        ]);
      }
      throw err;
    }
  }

  async login(input: loginInput): Promise<{
    accessToken: string;
    refreshToken: string;
    user: userWithoutPassword;
  }> {
    const { username, password } = input;
    const user = await UserModel.findOne({ username: username });

    try {
      if (!user) {
        throw new customError(
          400,
          "The entered credentials are incorrect",
          null,
        );
      }

      if (await bcrypt.compare(password, user.password)) {
        const accessToken = generateAccessToken(user.id, user.role);
        const refreshToken = generateRefreshToken(user.id, user.role);
        const { password, ...userWithoutPassword } = user.toObject();
        return { accessToken, refreshToken, user: userWithoutPassword };
      } else {
        throw new customError(
          400,
          "The entered credentials are incorrect",
          null,
        );
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getMe(userId: string): Promise<User> {
    try {
      const user = await UserModel.findById(userId);

      if (!user) {
        throw new customError(404, "The user was not found", null);
      }

      return await user.populate({
        path: "rooms",
        populate: {
          path: "lastMessage",
          model: "Message",
          populate: {
            path: "senderId",
            model: "User",
            select: "profile.firstName",
          },
        },
      });
    } catch (err) {
      throw err;
    }
  }

  async getMessages(userId: string, roomId: string): Promise<MessageDTO[]> {
    const roomIdObject = new mongoose.Types.ObjectId(roomId);
    try {
      const user = await UserModel.findById(userId);

      if (!user) {
        throw new customError(404, "The user was not found", null);
      }

      const hasAccess = user.rooms.some((room) => room.equals(roomIdObject));

      if (!hasAccess) {
        throw new customError(403, "The user is not permitted to view", null);
      }

      const messages = await MessageModel.find({ roomId: roomId }).populate(
        "senderId",
      );

      return messages.map((message) => ({
        ...message.toObject(),
        roomId: message.roomId.toString(),
        readBy: message.readBy.map((message) => message.toString()),
      }));
    } catch (err) {
      throw err;
    }
  }

  async getRooms(userId: string): Promise<IRoom[]> {
    try {
      const rooms = await RoomModel.find({ members: userId });

      return rooms;
    } catch (err) {
      throw err;
    }
  }

  async createRoom(input: createRoomInput, userId: string): Promise<IRoom> {
    try {
      const { name, isDirect } = input;
      const room: IRoom = {
        name,
        members: [new Types.ObjectId(userId)],
        admin: new Types.ObjectId(userId),
        lastMessage: null,
        lastActivity: new Date(),
        isDirect,
      };

      const response = await RoomModel.create(room);

      return response;
    } catch (err) {
      throw err;
    }
  }
}

export default new RegistrationDB();

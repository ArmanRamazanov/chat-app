import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { customError } from "@/utils/customError";
import { isTokenPayload } from "@/types/register.types";
import UserModel from "@/dbModels/User";
import MessageModel from "@/dbModels/Message";
import RoomModel from "./dbModels/Room";
import { Types } from "mongoose";

let io: Server;

export function initializeSocket(socketServer: Server) {
  io = socketServer;

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    try {
      if (!token) {
        return next(
          new customError(401, "The user is not authenticated", null),
        );
      }

      const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);

      if (!isTokenPayload(payload)) {
        return next(
          new customError(401, "The user is not authenticated", null),
        );
      }

      const user = await UserModel.findById(payload.sub).select(
        "profile.firstName",
      );

      if (!user) {
        return next(new customError(404, "The user is not found", null));
      }

      socket.data.userId = payload.sub;
      next();
    } catch (err) {
      return next(new customError(401, "The user is not authenticated", null));
    }
  });

  io.on("connection", async (socket) => {
    let user;
    try {
      user = await UserModel.findByIdAndUpdate(
        socket.data.userId,
        {
          isOnline: true,
          lastSeen: new Date(),
        },
        { new: true },
      );

      socket.data.username = user?.username;
    } catch (err) {
      return socket.disconnect();
    }

    if (!user) {
      return socket.disconnect();
    }

    user.rooms.forEach((roomId) => {
      socket.join(roomId.toString());
    });

    socket.on("send-message", async (content, roomId) => {
      try {
        if (!content || !roomId) {
          socket.emit("error", {
            message: "The content and roomId are required",
          });
          return;
        }
        if (!Types.ObjectId.isValid(roomId)) {
          socket.emit("error", { message: "invalid roomId" });
          return;
        }
        const room = await RoomModel.findOne({
          _id: roomId,
          members: socket.data.userId,
        });
        const msg = await MessageModel.create(content);

        if (!room) {
          socket.emit("error", {
            message: "The user does not have an access to the room",
          });
          return;
        }

        room.lastActivity = new Date();
        room.lastMessage = msg._id;

        await room.save();

        const msgPopulated = await msg.populate(
          "senderId",
          "profile.firstName",
        );

        const socketsInRoom = await io.in(roomId).fetchSockets();

        const activeUsers = socketsInRoom
          .map((s) => s.data.userId)
          .filter((id) => id !== content.senderId);

        if (activeUsers.length) {
          await msg.updateOne({
            $addToSet: { readBy: { $each: activeUsers } },
          });
        }

        io.to(roomId).emit("new-message", {
          ...msgPopulated.toObject(),
          readBy: [...msg.readBy, ...activeUsers],
        });

        socket.emit("update-room");
      } catch (err) {
        socket.emit("error", { message: "Something went wrong" });
      }
    });

    socket.on("message-read", async ({ roomId }) => {
      try {
        const userId = socket.data.userId;
        await MessageModel.updateMany(
          { roomId, readBy: { $nin: [userId] } },
          { $addToSet: { readBy: userId } },
        );

        socket.to(roomId).emit("messages-read", { roomId, userId });
      } catch {
        socket.emit("error", { message: "Something went wrong" });
      }
    });

    socket.on("typing", ({ roomId, isTyping }) => {
      socket.to(roomId).emit("user-typing", {
        userId: socket.data.userId,
        isTyping,
      });
    });

    socket.on("edit-message", async ({ msgId, content, roomId }) => {
      try {
        await MessageModel.findByIdAndUpdate(msgId, { content, edited: true });
        io.to(roomId).emit("message-edited", { msgId, content });
      } catch {}
    });

    socket.on("create-room", async (roomName, adminId) => {
      try {
        if (!roomName || typeof roomName !== "string") {
          return socket.emit("error", { message: "Invalid room name" });
        }
        const room = await RoomModel.create({
          name: roomName,
          members: [adminId],
          isDirect: false,
          admin: adminId,
        });

        await UserModel.findByIdAndUpdate(adminId, {
          $addToSet: { rooms: room.id },
        });

        socket.emit("room-created", room.toObject());
      } catch {
        socket.emit("error", { message: "Something went wrong" });
      }
    });

    socket.on("join-room", async (roomId, userId) => {
      try {
        const room = await RoomModel.findByIdAndUpdate(roomId, {
          $addToSet: { members: userId },
        });
        await UserModel.findByIdAndUpdate(userId, {
          $addToSet: { rooms: roomId },
        });
        socket.join(roomId);

        io.to(roomId).emit("room-joined", room?.toObject());
      } catch {
        socket.emit("error", { message: "Something went wrong" });
      }
    });

    socket.on("disconnect", async () => {
      const user = await UserModel.findByIdAndUpdate(socket.data.userId, {
        isOnline: false,
        lastSeen: new Date(),
      });

      io.emit("user-offline", {
        userId: socket.data.userId,
        username: user?.username,
        lastSeen: new Date(),
      });
    });

    socket.on("leave-room", async (roomId) => {
      const user = await UserModel.findByIdAndUpdate(
        socket.data.userId,
        {
          $pull: {
            rooms: roomId,
          },
        },
        { new: true },
      );

      const room = await RoomModel.findByIdAndUpdate(
        roomId,
        {
          $pull: {
            members: socket.data.userId,
          },
        },
        { new: true },
      );

      io.emit("user-left", room?.toObject(), user?.toObject());
    });
  });
}

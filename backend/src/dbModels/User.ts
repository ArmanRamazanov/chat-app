import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { type User, Role } from "@/types/register.types";

const UserSchema = new mongoose.Schema<User>({
  username: {
    type: String,
    required: [true, "The username is required"],
    unique: true,
  },
  password: { type: String, required: [true, "The password is required"] },
  role: {
    type: String,
    enum: Object.values(Role),
    default: Role.User,
  },
  rooms: {
    type: [Schema.Types.ObjectId],
    ref: "Room",
    default: [],
  },
  isOnline: {
    type: Boolean,
    default: false,
  },
  profile: {
    type: {
      firstName: { type: String, required: [true, "The name is required"] },
      surname: String,
      bio: String,
    },
    required: true,
  },
});

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

const UserModel = mongoose.model<User>("User", UserSchema);

export default UserModel;

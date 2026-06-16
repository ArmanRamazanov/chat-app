export function isCustomError(
  error: unknown,
): error is { error: string | { field: string; message: string }[] } {
  return typeof error === "object" && error !== null && "error" in error;
}

type Role = "admin" | "user";

// export interface Message {
//   id: number;
//   sender: string;
//   text: string;
//   time: string;
//   isOwn: boolean;
// }

export interface Chat {
  _id: string;
  name: string;
  lastMessage: Message;
  isDirect: boolean;
}

export interface Message {
  _id: string;
  roomId: string;
  senderId: string | User;
  content: string;
  readBy: string[];
  edited: boolean;
  // senderName: string;
  createdAt: string;
}

export interface Room {
  _id: string;
  name: string;
  members: User[];
  lastMessage: Message;
  isDirect: boolean;
}

export interface User {
  _id: string;
  username: string;
  password: string;
  role: Role;
  rooms: Room[];
  profile: {
    firstName: string;
    surname: string | null;
    bio: string | null;
  };
}

export function isPopulated(
  senderId: string | { profile: { firstName: string } },
) {
  return typeof senderId === "object" && "profile" in senderId;
}

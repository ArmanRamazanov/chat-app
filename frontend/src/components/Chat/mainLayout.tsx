import { useState, useEffect } from "react";
import type { Chat, User, Room } from "@/types/index.types";
import Sidebar from "./sideBar";
import ChatWindow from "./chatWindow";
import CreateRoomModal from "./createRoomModal";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import "@/styles/chat.css";

import { socket } from "@/utils/socket";
import { getLocalStorage } from "@/utils/localStorage";

// const MOCK_MESSAGES: Message[] = [
//   {
//     id: 1,
//     sender: "Alice",
//     text: "Hey, how's it going?",
//     time: "10:30",
//     isOwn: false,
//   },
//   {
//     id: 2,
//     sender: "You",
//     text: "Pretty good! Working on the chat app.",
//     time: "10:31",
//     isOwn: true,
//   },
//   {
//     id: 3,
//     sender: "Alice",
//     text: "Nice! How's the backend looking?",
//     time: "10:33",
//     isOwn: false,
//   },
//   {
//     id: 4,
//     sender: "You",
//     text: "Express + Mongoose, coming together nicely.",
//     time: "10:35",
//     isOwn: true,
//   },
//   {
//     id: 5,
//     sender: "Alice",
//     text: "Are you free later?",
//     time: "10:42",
//     isOwn: false,
//   },
// ];

export default function Chat() {
  const [activeTab, setActiveTab] = useState<"rooms" | "direct">("rooms");
  const [message, setMessage] = useState("");
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [roomsList, setRoomsList] = useState<Room[] | []>([]);
  const [me, setMe] = useState<User | null>(null);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  useEffect(() => {
    async function loadChats() {
      const result = await fetchWithAuth("http://localhost:3000/api/me");
      if (result?.success) {
        setMe(result.data);
        setRoomsList(result.data.rooms);
      }
    }

    loadChats();

    const token = getLocalStorage("token");
    if (token) {
      socket.auth = {
        token,
      };
      socket.connect();
    }

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSend = () => {
    if (!message.trim()) return;
    const messageObject = {
      roomId: selectedChat?._id ?? "",
      senderId: me?._id ?? "",
      readBy: [],
      edited: false,
      content: message,
    };
    socket.emit("send-message", messageObject, selectedChat?._id);
    setMessage("");
  };

  const handleCreateRoom = () => {
    if (!roomName.trim()) return;
    console.log("Yepp here");
    setRoomName("");
    setShowCreateRoom(false);
    socket.emit("create-room", roomName, me?._id);
  };

  return (
    <div className="chat-layout">
      <Sidebar
        roomsList={roomsList}
        me={me}
        selectedChat={selectedChat}
        setRoomsList={setRoomsList}
        setSelectedChat={setSelectedChat}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCreateRoom={() => setShowCreateRoom(true)}
      />

      <ChatWindow
        activeChat={selectedChat}
        message={message}
        onMessageChange={setMessage}
        onSend={handleSend}
        me={me}
        setRoomsList={setRoomsList}
        setMe={setMe}
      />

      {showCreateRoom && (
        <CreateRoomModal
          roomName={roomName}
          onChange={setRoomName}
          onCreate={handleCreateRoom}
          onClose={() => setShowCreateRoom(false)}
        />
      )}
    </div>
  );
}

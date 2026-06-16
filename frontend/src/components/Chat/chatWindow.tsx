// import type { Message } from "@/types/index.types";
import MessageList from "./messageList";
import MessageInput from "./messageInput";
import type { Chat, Message, Room, User } from "@/types/index.types";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import { socket } from "@/utils/socket";

type Props = {
  activeChat: Chat | null;
  message: string;
  onMessageChange: (value: string) => void;
  onSend: () => void;
  me: User | null;
  setMe: React.Dispatch<React.SetStateAction<User | null>>;
  setRoomsList: React.Dispatch<React.SetStateAction<Room[] | []>>;
};

export default function ChatWindow({
  activeChat,
  message,
  onMessageChange,
  onSend,
  me,
  setMe,
  setRoomsList,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [editingMsg, setEditingMsg] = useState<{
    id: string;
    content: string;
  } | null>(null);

  useEffect(() => {
    async function loadMessages() {
      const result = await fetchWithAuth(
        `http://localhost:3000/api/${activeChat?._id}/messages`,
      );
      if (result?.success) {
        setMessages(result.data);
      }
    }
    loadMessages();
  }, [activeChat]);

  useEffect(() => {
    socket.removeAllListeners("receive-message");
    socket.removeAllListeners("messages-read");
    socket.removeAllListeners("message-edited");

    socket.on("receive-message", (message) => {
      setMessages((prev) => [...prev, message]);
      setRoomsList((prev) =>
        prev.map((room) =>
          room._id === message.roomId
            ? { ...room, lastMessage: message }
            : room,
        ),
      );
    });

    socket.on("room-joined", (roomNew: Room) => {
      setRoomsList((prev) =>
        prev.map((roomOld) =>
          roomOld._id === roomNew._id ? roomNew : roomOld,
        ),
      );
    });

    socket.on("messages-read", ({ userId }) => {
      setMessages((prev) =>
        prev.map((msg) => ({
          ...msg,
          readBy: msg.readBy.includes(userId)
            ? msg.readBy
            : [...msg.readBy, userId],
        })),
      );
    });

    socket.on("message-edited", ({ msgId, content }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === msgId ? { ...msg, content, edited: true } : msg,
        ),
      );
    });

    return () => {
      socket.off("receive-message");
      socket.off("messages-read");
      socket.off("message-edited");
    };
  }, [setMe, setRoomsList]);

  function handleSend() {
    if (editingMsg) {
      socket.emit("edit-message", {
        msgId: editingMsg.id,
        content: message,
        roomId: activeChat?._id,
      });
      setEditingMsg(null);
      onMessageChange("");
    } else {
      onSend();
    }
  }

  return (
    <main className="chat-main">
      <div className="chat-header">
        <div className="chat-header-info" />
      </div>

      <MessageList
        messages={messages}
        me={me}
        onEditMessage={(msg) => {
          setEditingMsg({ id: msg._id, content: msg.content });
          onMessageChange(msg.content);
        }}
      />

      <MessageInput
        value={message}
        placeholder="Message ..."
        onChange={onMessageChange}
        onSend={handleSend}
        editingMsg={editingMsg}
        onCancelEdit={() => {
          setEditingMsg(null);
          onMessageChange("");
        }}
      />
    </main>
  );
}

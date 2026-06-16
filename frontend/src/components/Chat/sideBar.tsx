import {
  type User,
  type Chat,
  type Room,
  isPopulated,
} from "@/types/index.types";
import { socket } from "@/utils/socket";
import { useEffect } from "react";

type Props = {
  me: User | null;
  selectedChat: Chat | null;
  activeTab: "rooms" | "direct";
  setSelectedChat: (chat: Chat) => void;
  onTabChange: (tab: "rooms" | "direct") => void;
  onCreateRoom: () => void;
  roomsList: Room[] | [];
  setRoomsList: React.Dispatch<React.SetStateAction<Room[]>>;
};

export default function Sidebar({
  roomsList,
  me,
  activeTab,
  selectedChat,
  setSelectedChat,
  onTabChange,
  onCreateRoom,
  setRoomsList,
}: Props) {
  useEffect(() => {
    socket.removeAllListeners("room-created");

    socket.on("room-created", (room: Room) => {
      console.log("Yep the room received: ", room);
      setRoomsList((prev) => [...prev, room]);
    });

    return () => {
      socket.off("room-created");
    };
  }, [setRoomsList]);

  const filtered = roomsList.filter((c) =>
    activeTab === "direct" ? c.isDirect : !c.isDirect,
  );

  filtered?.forEach((chat) => {
    console.log(chat);
  });

  function setActive(chat: Room) {
    setSelectedChat(chat);
    socket.emit("open-room", { roomId: chat._id });
  }

  return (
    <aside className="chat-sidebar">
      {/* User profile */}
      <div className="sidebar-profile">
        <div className="profile-avatar">Y</div>
        <div className="profile-info">
          <span className="profile-name">{me?.profile.firstName}</span>
          <span className="profile-status">● Online</span>
        </div>
        <button className="logout-btn" title="Logout">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>

      {/* Create room button */}
      <button className="create-room-btn" onClick={onCreateRoom}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Create Room
      </button>

      {/* Tabs */}
      <div className="sidebar-tabs">
        <button
          className={`sidebar-tab ${activeTab === "rooms" ? "active" : ""}`}
          onClick={() => onTabChange("rooms")}
        >
          Rooms
        </button>
        <button
          className={`sidebar-tab ${activeTab === "direct" ? "active" : ""}`}
          onClick={() => onTabChange("direct")}
        >
          Direct
        </button>
      </div>

      {/* Chat list */}
      <ul className="chat-list">
        {filtered?.map((chat) => (
          <li
            key={chat._id}
            className={`chat-list-item ${
              selectedChat?._id === chat._id ? "active" : ""
            }`}
            onClick={() => setActive(chat)}
          >
            <div className="chat-item-avatar">
              {chat.name.replace("#", "").trim()[0]?.toUpperCase()}
            </div>
            <div className="chat-item-info">
              <div className="chat-item-top">
                <span className="chat-item-name">{chat.name}</span>
                {/* <span className="chat-item-time">{chat.time}</span> */}
              </div>
              <div className="chat-item-bottom">
                <span className="chat-item-last">
                  {chat.lastMessage && (
                    <>
                      <span style={{ fontWeight: 600 }}>
                        {isPopulated(chat.lastMessage.senderId) &&
                        chat.lastMessage.senderId._id === me?._id
                          ? "You"
                          : isPopulated(chat.lastMessage.senderId) &&
                            chat.lastMessage.senderId.profile.firstName}
                        {": "}
                      </span>
                      {chat.lastMessage.content}
                    </>
                  )}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}

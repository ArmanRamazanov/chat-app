import { isPopulated, type Message, type User } from "@/types/index.types";

type Props = {
  messages: Message[];
  me: User | null;
  onEditMessage: (msg: Message) => void;
};

export default function MessageList({ messages, me, onEditMessage }: Props) {
  return (
    <div className="chat-messages">
      {messages.map((msg) => {
        let isMine;
        if (isPopulated(msg.senderId)) {
          isMine = msg.senderId._id.toString() === me?._id.toString();
        } else {
          isMine = msg.senderId === me?._id;
        }

        const isRead = msg.readBy.some((id) => id !== me?._id);

        return (
          <div key={msg._id} className={`message ${isMine ? "own" : ""}`}>
            {!isMine && (
              <div className="message-avatar">
                {isPopulated(msg.senderId)
                  ? msg.senderId.profile.firstName?.[0]
                  : "U"}
              </div>
            )}

            <div className="message-content">
              {!isMine && (
                <span className="message-sender">
                  {isPopulated(msg.senderId)
                    ? msg.senderId.profile.firstName
                    : "User"}
                </span>
              )}

              <div
                className="message-bubble"
                onContextMenu={(e) => {
                  e.preventDefault();
                  if (isMine) onEditMessage(msg);
                }}
              >
                {msg.content}
              </div>
              {msg.edited && <span className="message-edited">edited</span>}

              <span className="message-time">
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>

              {isMine && (
                <span className="message-seen">
                  {isRead ? "Seen" : "Delivered"}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

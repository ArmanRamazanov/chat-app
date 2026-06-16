type Props = {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onSend: () => void;
  editingMsg: { id: string; content: string } | null;
  onCancelEdit: () => void;
};

export default function MessageInput({
  value,
  placeholder,
  onChange,
  onSend,
  editingMsg,
  onCancelEdit,
}: Props) {
  return (
    <div className="chat-input-area">
      {editingMsg && (
        <div className="editing-banner">
          <span>Editing message</span>
          <button className="cancel-edit-btn" onClick={onCancelEdit}>
            ✕
          </button>
        </div>
      )}
      <div className="chat-input-row">
        <input
          className="chat-input"
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSend()}
        />
        <button className="send-btn" onClick={onSend} disabled={!value.trim()}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}

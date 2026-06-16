type Props = {
  roomName: string;
  onChange: (value: string) => void;
  onCreate: () => void;
  onClose: () => void;
};

export default function CreateRoomModal({
  roomName,
  onChange,
  onCreate,
  onClose,
}: Props) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Create a Room</h2>
        <label>
          Room name
          <input
            type="text"
            placeholder="e.g. design, backend, random"
            value={roomName}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onCreate()}
            autoFocus
          />
        </label>
        <div className="modal-actions">
          <button className="modal-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="modal-create"
            onClick={onCreate}
            disabled={!roomName.trim()}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

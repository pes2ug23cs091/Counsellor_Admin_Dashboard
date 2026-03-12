import { Icons } from "../utils/icons";

export default function DeleteConfirmationModal({ isOpen, title, message, onConfirm, onClose, item }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay active" onClick={onClose}>
      <div className="modal confirmation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ borderBottom: "none" }}>
          <h2 className="modal-title">{title || "Confirm Delete"}</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-content">
          <span className="confirmation-icon">⚠️</span>
          <p className="confirmation-message">
            {message || (item ? `Are you sure you want to delete ${item.name}?` : "Are you sure?")}
          </p>
          <p className="confirmation-submessage">This action cannot be undone.</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={() => onConfirm(item.id)}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import './ConfirmModal.css';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', isDestructive = false }) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal animate-scale-in">
        <button className="confirm-modal-close" onClick={onClose}>
            <X size={20} />
        </button>

        <div className="confirm-modal-header">
            <div className={`confirm-icon-box ${isDestructive ? 'destructive' : 'primary'}`}>
                <AlertTriangle size={24} />
            </div>
            <h3>{title}</h3>
        </div>

        <div className="confirm-modal-body">
            <p>{message}</p>
        </div>

        <div className="confirm-modal-footer">
            <button className="btn-cancel" onClick={onClose}>Cancel</button>
            <button 
                className={`btn-confirm ${isDestructive ? 'destructive' : 'primary'}`}
                onClick={() => {
                    onConfirm();
                    onClose();
                }}
            >
                {confirmText}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

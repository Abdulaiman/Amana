import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle } from 'lucide-react';
import './ConfirmModal.css';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', isDestructive = false }) => {
  const [loading, setLoading] = useState(false);
  if (!isOpen) return null;

  const handleConfirmClick = async () => {
    setLoading(true);
    try {
      if (onConfirm) {
        await onConfirm();
      }
      onClose();
    } catch (err) {
      console.error('Confirmation action error:', err);
    } finally {
      setLoading(false);
    }
  };

  const modalNode = (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal animate-scale-in" onClick={e => e.stopPropagation()}>
        <button className="confirm-modal-close" onClick={onClose} disabled={loading}>
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
            <button className="btn-cancel" onClick={onClose} disabled={loading}>Cancel</button>
            <button 
                className={`btn-confirm ${isDestructive ? 'destructive' : 'primary'}`}
                onClick={handleConfirmClick}
                disabled={loading}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
                {loading ? (
                  <>
                    <span className="btn-spinner-sm" style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    <span>Processing...</span>
                  </>
                ) : confirmText}
            </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : modalNode;
};

export default ConfirmModal;

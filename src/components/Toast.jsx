import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import './Toast.css';

const Toast = ({ message, type, onClose }) => {
  const icons = {
    success: <CheckCircle size={20} />,
    error: <AlertCircle size={20} />,
    info: <Info size={20} />
  };

  return (
    <div className={`toast ${type}`}>
      <div className="toast-icon">
        {icons[type] || icons.info}
      </div>
      <div className="toast-content">
        {message}
      </div>
      <button className="toast-close" onClick={onClose}>
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;

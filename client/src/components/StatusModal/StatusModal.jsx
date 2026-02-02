import React from 'react';
import './StatusModal.css';

const StatusModal = ({ isOpen, title, message, type, onClose, onConfirm, confirmText }) => {
  if (!isOpen) return null;

  return (
    <div className="status-modal-overlay">
      <div className="status-modal-box">
        <div className="status-modal-icon" style={{ color: type === 'error' ? '#ff4d4d' : '#28a745' }}>
          {type === 'error' ? '✕' : '✓'}
        </div>
        <h2 className="status-modal-title">
          {title || (type === 'error' ? 'FEL' : 'SUCCESS')}
        </h2>
        <p className="status-modal-message">{message}</p>
        
        <div className="status-modal-actions">
          {onConfirm && (
            <button onClick={onConfirm} className="status-modal-btn-primary">
              {confirmText || 'FORTSÄTT'}
            </button>
          )}
          <button onClick={onClose} className="status-modal-btn-secondary">
            {onConfirm ? 'AVBRYT' : 'STÄNG'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusModal;
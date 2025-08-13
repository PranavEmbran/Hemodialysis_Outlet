import React from 'react';
import { toast } from 'react-toastify';

interface CancelButtonProps {
  scheduleId: string;
  onCancel: (scheduleId: string) => void;
  disabled?: boolean;
  tooltip?: string;
}

const CancelButton: React.FC<CancelButtonProps> = ({ 
  scheduleId, 
  onCancel, 
  disabled = false, 
  tooltip = "Cancel this session" 
}) => {
  const handleClick = () => {
    if (disabled) return;
    
    const confirmed = window.confirm('Are you sure you want to cancel this session? This action cannot be undone.');
    if (confirmed) {
      onCancel(scheduleId);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      title={tooltip}
      style={{
        background: disabled ? '#ccc' : '#f44336',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        padding: '4px 8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: '12px',
        opacity: disabled ? 0.6 : 1
      }}
    >
      Cancel
    </button>
  );
};

export default CancelButton;
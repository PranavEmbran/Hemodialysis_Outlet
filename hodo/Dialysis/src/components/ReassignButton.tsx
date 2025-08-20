import React from 'react';
import { toast } from 'react-toastify';

interface ReassignButtonProps {
  scheduleId: string;
  onReassign: (scheduleId: string) => void;
  disabled?: boolean;
  tooltip?: string;
}

const ReassignButton: React.FC<ReassignButtonProps> = ({ 
  scheduleId, 
  onReassign, 
  disabled = false, 
  tooltip = "Reassign this session" 
}) => {
  const handleClick = () => {
    if (disabled) return;
    
    const confirmed = window.confirm('Are you sure you want to reassign this session?');
    if (confirmed) {
      onReassign(scheduleId);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      title={tooltip}
      style={{
        background: disabled ? '#ccc' : '#4caf50',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        padding: '4px 8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: '12px',
        opacity: disabled ? 0.6 : 1
      }}
    >
      &#x21bb;
      {/* Reassign */}
    </button>
  );
};

export default ReassignButton;
import React from 'react';
import styles from '../styles/EditButton.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';

interface EditButtonProps {
  onClick: (e: React.MouseEvent) => void;
  size?: number;
  className?: string;
}

const EditButton: React.FC<EditButtonProps> = ({ 
  onClick, 
  size = 14,
  className = '' 
}) => {
  return (
    <button
      onClick={onClick}
      className={`${styles.editButton} ${className}`}
      aria-label="Edit"
    >
     <FontAwesomeIcon icon={faPenToSquare} />
    </button>
  );
};

export default EditButton;
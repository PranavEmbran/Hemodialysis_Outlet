import React from 'react';
import DeleteIcon from '../assets/delete.png'
import '../styles/DeleteButton.css';

interface DeleteButtonProps {
  onClick: () => void;
  id?: string | number;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ onClick, id }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn btn-sm btn-outline-danger"
      aria-label={`Delete ${id}`}
      title="Delete"
    >
      {/* Replace this with your custom delete icon later */}
      <img src={DeleteIcon} alt="Delete" />
    </button>
  );
};

export default DeleteButton;

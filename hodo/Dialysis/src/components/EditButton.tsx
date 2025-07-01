import React from 'react';
import EditIcon from '../assets/edit.png'
import '../styles/EditButton.css';


interface EditButtonProps {
  onClick: () => void;
  id?: string | number;
}

const EditButton: React.FC<EditButtonProps> = ({ onClick, id }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn btn-sm btn-outline-primary me-1"
      aria-label={`Edit ${id}`}
      title="Edit"
    >
      {/* Replace this with your custom edit icon later */}
      <img src={EditIcon} alt="Edit" />
    </button>
  );
};

export default EditButton;

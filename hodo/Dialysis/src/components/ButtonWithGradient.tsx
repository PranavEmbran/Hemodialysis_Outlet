import React from 'react';
import '../styles/ButtonWithGradient.css';

export interface ButtonWithGradientProps {
  text?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  processing?: boolean;
  className?: string;
}

const ButtonWithGradient: React.FC<ButtonWithGradientProps> = ({
  text,
  children,
  onClick,
  type,
  disabled = false,
  processing = false,
  className = '',
}) => {
  return (
    <button
      className={`btn-with-gradient ${className}`}
      onClick={onClick}
      type={type ?? 'button'}
      disabled={disabled || processing}
    >
      {processing && <span className="spinner" />}
      {children ?? text}
    </button>
  );
};

export default ButtonWithGradient;

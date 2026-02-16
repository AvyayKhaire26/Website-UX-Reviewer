import React from 'react';

interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'url' | 'email';
  error?: string;
  disabled?: boolean;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  value,
  onChange,
  placeholder = '',
  type = 'text',
  error,
  disabled = false,
  fullWidth = false,
}) => {
  const baseStyles = 'px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200';
  const normalStyles = 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';
  const errorStyles = 'border-red-500 focus:ring-red-500 focus:border-red-500';
  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <div className={widthStyle}>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`${baseStyles} ${error ? errorStyles : normalStyles} ${widthStyle}`}
      />
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
};

import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function PasswordInput({ value, onChange, placeholder = '••••••••', className = '', ...props }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        className={`input pr-10 ${className}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        tabIndex={-1}
      >
        {show ? <FiEyeOff size={16} /> : <FiEye size={16} />}
      </button>
    </div>
  );
}

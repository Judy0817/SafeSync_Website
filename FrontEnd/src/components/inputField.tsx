// InputField.tsx
import React, { useState, ChangeEvent } from 'react';

interface InputFieldProps {
  placeholder: string;
  type:string;
  value:string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const InputField: React.FC<InputFieldProps> = ({ placeholder,type, value, onChange }) => {

  return (
    <div>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className='input-field'
      />
      
    </div>
  );
};

export default InputField;

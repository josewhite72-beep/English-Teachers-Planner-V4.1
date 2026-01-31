import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';

const EditableTextarea = ({ value, onChange, placeholder, className, rows = 3 }) => {
  const [localValue, setLocalValue] = useState(value || '');
  
  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);
  
  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
  };
  
  const handleBlur = () => {
    if (localValue !== value) {
      onChange(localValue);
    }
  };
  
  return (
    <Textarea
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      className={className}
      placeholder={placeholder}
      rows={rows}
    />
  );
};

export default EditableTextarea;

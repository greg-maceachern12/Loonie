import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const PersonInput = ({ 
  person, 
  personId, 
  onUpdate, 
  onRemove, 
  disabled = false,
  isPending = false,
  colorIndex = 0
}) => {
  const [localName, setLocalName] = useState(person);
  const [isFocused, setIsFocused] = useState(false);
  const [isActive, setIsActive] = useState(Boolean(person));

  // Apple-style pastel colors
  const colors = [
    { bg: 'bg-blue-100', text: 'text-blue-600' },
    { bg: 'bg-pink-100', text: 'text-pink-600' },
    { bg: 'bg-purple-100', text: 'text-purple-600' },
    { bg: 'bg-green-100', text: 'text-green-600' },
    { bg: 'bg-orange-100', text: 'text-orange-600' }
  ];
  
  const avatarColor = colors[colorIndex % colors.length];
  
  useEffect(() => {
    setLocalName(person);
    setIsActive(Boolean(person));
  }, [person]);

  const handleBlur = () => {
    setIsFocused(false);
    if (localName !== person) {
      onUpdate(personId, localName);
    }
    // Set active state based on whether there's a name
    setIsActive(Boolean(localName));
  };

  const handleClick = () => {
    if (!isActive) {
      setIsActive(true);
      setIsFocused(true);
    }
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!isActive && !person) {
    return (
      <div 
        onClick={handleClick}
        className="flex items-center gap-2 p-1.5 rounded-lg cursor-pointer hover:bg-gray-50"
      >
        <div className={`flex items-center justify-center h-8 w-8 rounded-full 
          bg-gray-100 text-gray-400 font-medium`}>
          +
        </div>
        <span className="text-gray-400">Add person</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 p-1.5 rounded-lg transition-all duration-200
      ${isFocused ? 'bg-gray-50 shadow-sm' : 'hover:bg-gray-50'}`}>
      <div className={`flex items-center justify-center h-8 w-8 rounded-full 
        ${avatarColor.bg} ${avatarColor.text} font-medium
        transition-transform ${isFocused ? 'scale-105' : ''}`}>
        {getInitials(localName)}
      </div>
      <input
        className={`flex-1 px-2 py-1 rounded-md transition-all duration-200
          placeholder:text-gray-400 border-none focus:ring-0
          ${isPending ? 'bg-gray-50' : 'bg-transparent'}`}
        placeholder="Enter name"
        value={localName}
        onChange={(e) => setLocalName(e.target.value)}
        onBlur={handleBlur}
        onFocus={() => setIsFocused(true)}
        onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
        disabled={isPending}
        autoFocus={isActive && !person}
      />
      <button
        onClick={() => {
          onRemove(personId);
          setIsActive(false);
        }}
        disabled={disabled || isPending}
        className={`p-1 rounded-full transition-colors duration-200
          ${disabled || isPending 
            ? 'opacity-50 cursor-not-allowed' 
            : 'text-gray-400 hover:bg-gray-200 hover:text-gray-600'}`}
        aria-label="Remove person"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default PersonInput;
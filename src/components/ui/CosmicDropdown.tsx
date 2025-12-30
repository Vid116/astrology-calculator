'use client';

import { useState, useRef, useEffect } from 'react';

interface CosmicDropdownProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export function CosmicDropdown({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  error,
}: CosmicDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [flipUp, setFlipUp] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleToggle = () => {
    if (!isOpen && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = 300;
      setFlipUp(spaceBelow < dropdownHeight && rect.top > dropdownHeight);
    }
    setIsOpen(!isOpen);
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div
      ref={wrapperRef}
      className={`cosmic-dropdown ${isOpen ? 'open' : ''} ${flipUp ? 'flip-up' : ''}`}
    >
      <button
        type="button"
        className={`cosmic-dropdown-toggle ${error ? 'has-error' : ''}`}
        onClick={handleToggle}
      >
        {selectedOption ? (
          <span>{selectedOption.label}</span>
        ) : (
          <span className="placeholder">{placeholder}</span>
        )}
      </button>
      <div className={`cosmic-dropdown-menu ${isOpen ? 'show' : ''}`}>
        {options.map(option => (
          <div
            key={option.value}
            className={`cosmic-dropdown-option ${value === option.value ? 'selected' : ''}`}
            onClick={() => handleSelect(option.value)}
          >
            {option.label}
          </div>
        ))}
      </div>
      {error && <div className="validation-error show">{error}</div>}
    </div>
  );
}

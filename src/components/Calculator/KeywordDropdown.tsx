'use client';

import { useState, useRef, useEffect } from 'react';

interface KeywordDropdownProps {
  label: string;
  signName: string;
  keywords: string[];
  value: string;
  onChange: (value: string) => void;
}

export function KeywordDropdown({
  label,
  signName,
  keywords,
  value,
  onChange,
}: KeywordDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [flipUp, setFlipUp] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredKeywords = keywords.filter(kw =>
    kw.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch(value);
      }
    }

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [value]);

  const handleFocus = () => {
    setSearch('');
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setFlipUp(spaceBelow < 200 && rect.top > 200);
    }
    setIsOpen(true);
  };

  const handleSelect = (keyword: string) => {
    onChange(keyword);
    setSearch(keyword);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearch(value);
    } else if (e.key === 'Enter' && filteredKeywords.length > 0) {
      e.preventDefault();
      handleSelect(filteredKeywords[0]);
    }
  };

  if (!keywords || keywords.length === 0) {
    return (
      <div className="keyword-dropdown-group">
        <label className="keyword-dropdown-label">
          {label}: <span className="keyword-sign-name">{signName}</span>
        </label>
        <div className="keyword-dropdown-empty">No keywords available</div>
      </div>
    );
  }

  return (
    <div className="keyword-dropdown-group" ref={wrapperRef}>
      <label className="keyword-dropdown-label">
        {label}: <span className="keyword-sign-name">{signName}</span>
      </label>
      <div className={`keyword-dropdown-wrapper ${flipUp ? 'flip-up' : ''}`}>
        <input
          ref={inputRef}
          type="text"
          className="keyword-search-input"
          placeholder="Type to search or select..."
          value={isOpen ? search : value}
          onChange={e => setSearch(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
        />
        {isOpen && (
          <div className="keyword-dropdown-list show">
            {filteredKeywords.map(keyword => (
              <div
                key={keyword}
                className={`keyword-dropdown-item ${value === keyword ? 'selected' : ''}`}
                onClick={() => handleSelect(keyword)}
              >
                {keyword}
              </div>
            ))}
            {filteredKeywords.length === 0 && (
              <div className="keyword-dropdown-item disabled">No matches found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

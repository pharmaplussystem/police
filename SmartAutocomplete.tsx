import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Plus, Check } from 'lucide-react';

export interface AutocompleteOption<T = any> {
  label: string;
  value: string;
  secondary?: string;
  badge?: string;
  item?: T;
}

interface SmartAutocompleteProps<T = any> {
  value: string;
  onChange: (value: string, selectedItem?: T) => void;
  options: (AutocompleteOption<T> | string)[];
  placeholder?: string;
  label?: string;
  allowCustom?: boolean; // Allows typing and saving custom entry
  onAddNew?: (newValue: string) => void;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  id?: string;
}

export function SmartAutocomplete<T = any>({
  value,
  onChange,
  options,
  placeholder = 'Type to search or enter custom...',
  label,
  allowCustom = true,
  onAddNew,
  className = '',
  inputClassName = '',
  disabled = false,
  required = false,
  autoFocus = false,
  id
}: SmartAutocompleteProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Normalize options
  const normalizedOptions: AutocompleteOption<T>[] = useMemo(() => {
    return options.map(opt => {
      if (typeof opt === 'string') {
        return { label: opt, value: opt };
      }
      return opt;
    });
  }, [options]);

  // Filtered and ranked options based on input value
  const filteredOptions = useMemo(() => {
    const query = value.trim().toLowerCase();
    if (!query) {
      return normalizedOptions.slice(0, 30);
    }

    // Categorize into exact, prefix, and contains
    const exact: AutocompleteOption<T>[] = [];
    const prefix: AutocompleteOption<T>[] = [];
    const contains: AutocompleteOption<T>[] = [];

    normalizedOptions.forEach(opt => {
      const l = opt.label.toLowerCase();
      const sec = opt.secondary ? opt.secondary.toLowerCase() : '';
      if (l === query) {
        exact.push(opt);
      } else if (l.startsWith(query)) {
        prefix.push(opt);
      } else if (l.includes(query) || sec.includes(query)) {
        contains.push(opt);
      }
    });

    return [...exact, ...prefix, ...contains].slice(0, 30);
  }, [normalizedOptions, value]);

  // Check if current input matches any existing option exactly
  const hasExactMatch = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return false;
    return normalizedOptions.some(o => o.label.toLowerCase() === q || o.value.toLowerCase() === q);
  }, [normalizedOptions, value]);

  // Total selectable items (filtered items + optional "Add custom" item)
  const showCustomOption = allowCustom && value.trim().length > 0 && !hasExactMatch;
  const totalItemCount = filteredOptions.length + (showCustomOption ? 1 : 0);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(0);
      } else {
        setHighlightedIndex(prev => (prev + 1) % totalItemCount);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(totalItemCount - 1);
      } else {
        setHighlightedIndex(prev => (prev - 1 + totalItemCount) % totalItemCount);
      }
    } else if (e.key === 'Enter') {
      if (isOpen && highlightedIndex >= 0) {
        e.preventDefault();
        if (highlightedIndex < filteredOptions.length) {
          const selected = filteredOptions[highlightedIndex];
          handleSelect(selected);
        } else if (showCustomOption) {
          handleSelectCustom();
        }
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const handleSelect = (option: AutocompleteOption<T>) => {
    onChange(option.value, option.item);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleSelectCustom = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onChange(trimmed);
    if (onAddNew) {
      onAddNew(trimmed);
    }
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  // Helper to highlight matching text in labels
  const renderHighlightedText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-amber-200 text-slate-900 font-bold px-0.5 rounded">
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="block font-semibold text-slate-700 mb-1 text-xs">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          id={id}
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => {
            onChange(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoFocus={autoFocus}
          className={`w-full border border-slate-300 rounded px-3 py-1.5 text-xs bg-white text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-shadow ${inputClassName}`}
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <Search className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto text-xs py-1">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, idx) => {
              const isSelected = value.trim().toLowerCase() === opt.value.toLowerCase();
              const isHighlighted = idx === highlightedIndex;

              return (
                <div
                  key={`${opt.value}-${idx}`}
                  onClick={() => handleSelect(opt)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`px-3 py-2 cursor-pointer flex items-center justify-between transition-colors ${
                    isHighlighted ? 'bg-blue-50 text-blue-950 font-medium' : isSelected ? 'bg-slate-50 font-semibold' : 'hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="flex-1 mr-2">
                    <div className="flex items-center gap-1.5">
                      <span>{renderHighlightedText(opt.label, value)}</span>
                      {opt.badge && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    {opt.secondary && (
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {opt.secondary}
                      </div>
                    )}
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                </div>
              );
            })
          ) : !showCustomOption ? (
            <div className="px-3 py-3 text-center text-slate-400 italic">
              No matching records found
            </div>
          ) : null}

          {/* Option to Use / Add Custom Entry */}
          {showCustomOption && (
            <div
              onClick={handleSelectCustom}
              onMouseEnter={() => setHighlightedIndex(filteredOptions.length)}
              className={`px-3 py-2 cursor-pointer border-t border-slate-100 flex items-center gap-2 transition-colors ${
                highlightedIndex === filteredOptions.length ? 'bg-amber-50 text-amber-900 font-semibold' : 'bg-slate-50/60 hover:bg-amber-50/80 text-amber-800'
              }`}
            >
              <Plus className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <div>
                <span className="font-semibold">Add / Use custom: </span>
                <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-200">"{value.trim()}"</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

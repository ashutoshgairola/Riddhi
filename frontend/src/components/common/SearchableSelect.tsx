// src/components/common/SearchableSelect.tsx
import { Check, ChevronDown, Search } from 'lucide-react';
import { FC, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface SearchableSelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  subtitle?: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  wrapperClassName?: string;
  /** Label for the empty/none option (value = '') */
  emptyLabel?: string;
}

const SearchableSelect: FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  error = false,
  wrapperClassName = '',
  emptyLabel,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = query
    ? options.filter(
        (o) =>
          o.label.toLowerCase().includes(query.toLowerCase()) ||
          (o.subtitle ?? '').toLowerCase().includes(query.toLowerCase()),
      )
    : options;

  // Position the portal dropdown relative to the trigger
  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const dropdownHeight = 280; // approx max height
    const openUpward = spaceBelow < dropdownHeight && rect.top > dropdownHeight;
    setDropdownStyle({
      position: 'fixed',
      left: rect.left,
      width: rect.width,
      ...(openUpward
        ? { bottom: window.innerHeight - rect.top, top: 'auto' }
        : { top: rect.bottom + 4, bottom: 'auto' }),
      zIndex: 9999,
    });
  };

  useEffect(() => {
    if (open) {
      updatePosition();
      setTimeout(() => inputRef.current?.focus(), 0);
      setQuery('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Reposition on scroll/resize
  useEffect(() => {
    if (!open) return;
    const handler = () => updatePosition();
    window.addEventListener('scroll', handler, true);
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('scroll', handler, true);
      window.removeEventListener('resize', handler);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setOpen(false);
  };

  const dropdown = open
    ? createPortal(
        <div
          ref={dropdownRef}
          style={dropdownStyle}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl overflow-hidden"
        >
          <div className="p-2 border-b border-gray-100 dark:border-gray-700">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="max-h-52 overflow-y-auto">
            {emptyLabel !== undefined && (
              <button
                type="button"
                onClick={() => handleSelect('')}
                className={`w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between ${
                  value === ''
                    ? 'text-green-600 dark:text-green-400 font-medium'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <span>{emptyLabel}</span>
                {value === '' && <Check size={14} />}
              </button>
            )}

            {filtered.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between gap-2 ${
                  option.value === value
                    ? 'text-green-600 dark:text-green-400 font-medium'
                    : 'text-gray-900 dark:text-gray-100'
                }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  {option.icon && (
                    <span className="shrink-0 w-5 h-5 flex items-center justify-center">
                      {option.icon}
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block truncate">{option.label}</span>
                    {option.subtitle && (
                      <span className="block text-xs text-gray-400 dark:text-gray-500 truncate font-normal">
                        {option.subtitle}
                      </span>
                    )}
                  </span>
                </span>
                {option.value === value && <Check size={14} className="shrink-0" />}
              </button>
            ))}

            {filtered.length === 0 && (
              <p className="px-3 py-4 text-sm text-center text-gray-400 dark:text-gray-500">
                No results
              </p>
            )}
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <div className={`relative ${wrapperClassName}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 border ${
          error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
        } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm`}
      >
        <span className="flex items-center gap-2 min-w-0">
          {selected?.icon && (
            <span className="shrink-0 w-5 h-5 flex items-center justify-center">
              {selected.icon}
            </span>
          )}
          <span className={selected ? 'truncate' : 'text-gray-400 dark:text-gray-500 truncate'}>
            {selected ? selected.label : (emptyLabel && !value ? emptyLabel : placeholder)}
          </span>
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-gray-400 dark:text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {dropdown}
    </div>
  );
};

export default SearchableSelect;

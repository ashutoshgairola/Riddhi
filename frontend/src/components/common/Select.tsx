// src/components/common/Select.tsx
import { ChevronDown } from 'lucide-react';
import { FC, SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  wrapperClassName?: string;
}

const Select: FC<SelectProps> = ({ error = false, wrapperClassName = '', children, ...props }) => (
  <div className={`relative ${wrapperClassName}`}>
    <select
      className={`w-full appearance-none px-3 py-3 pr-10 border ${
        error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
      } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm`}
      {...props}
    >
      {children}
    </select>
    <ChevronDown
      size={16}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none"
    />
  </div>
);

export default Select;

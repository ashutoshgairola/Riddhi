// src/components/common/Spinner.tsx
import { FC } from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const Spinner: FC<SpinnerProps> = ({ size = 'md', color = 'green' }) => {
  const getSize = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-8 h-8';
      case 'md':
      default:
        return 'w-6 h-6';
    }
  };

  const getColor = () => {
    switch (color) {
      case 'blue':
        return 'border-blue-500';
      case 'red':
        return 'border-red-500';
      case 'yellow':
        return 'border-yellow-500';
      case 'green':
      default:
        return 'border-green-500';
    }
  };

  return (
    <div
      className={`${getSize()} border-2 ${getColor()} border-t-transparent rounded-full animate-spin`}
    ></div>
  );
};

export default Spinner;

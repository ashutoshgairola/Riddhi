import { motion } from 'framer-motion';

interface EmptyStateProps {
  image: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}

const EmptyState = ({ image, title, description, action }: EmptyStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <img src={image} alt={title} className="w-44 h-44 mb-6 select-none" draggable={false} />
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
};

export default EmptyState;

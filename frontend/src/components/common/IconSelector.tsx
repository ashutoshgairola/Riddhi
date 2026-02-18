// src/components/common/IconSelector.tsx
import { FC, useState } from 'react';

import {
  Award,
  Baby,
  Bike,
  Book,
  Briefcase,
  Building,
  Bus,
  Calculator,
  Calendar,
  Camera,
  Car,
  Clock,
  Cloud,
  Coffee,
  CreditCard,
  Crown,
  DollarSign,
  Dumbbell,
  FileText,
  Film,
  Fuel,
  Gamepad2,
  Gem,
  Gift,
  GraduationCap,
  HardHat,
  Headphones,
  Heart,
  Home,
  IceCream,
  Laptop,
  MapPin,
  Monitor,
  Moon,
  MoreHorizontal,
  Music,
  Package,
  Palette,
  PawPrint,
  Phone,
  PiggyBank,
  Pill,
  Pizza,
  Plane,
  Receipt,
  Scissors,
  Search,
  ShieldCheck,
  Shirt,
  ShoppingCart,
  Smartphone,
  Star,
  Stethoscope,
  Sun,
  Target,
  Train,
  TreePine,
  TrendingUp,
  Umbrella,
  Utensils,
  Wallet,
  Wine,
  Wrench,
  Zap,
} from 'lucide-react';

interface IconSelectorProps {
  selectedIcon: string;
  onIconSelect: (iconValue: string) => void;
  className?: string;
}

// Icon options for categories organized by category
const iconCategories = {
  Essential: [
    { value: 'home', label: 'Home', Icon: Home },
    { value: 'wallet', label: 'Finance', Icon: Wallet },
    { value: 'dollar-sign', label: 'Income', Icon: DollarSign },
    { value: 'credit-card', label: 'Credit Card', Icon: CreditCard },
    { value: 'piggy-bank', label: 'Savings', Icon: PiggyBank },
    { value: 'trending-up', label: 'Investment', Icon: TrendingUp },
    { value: 'calculator', label: 'Budget', Icon: Calculator },
    { value: 'receipt', label: 'Receipt', Icon: Receipt },
  ],
  'Food & Dining': [
    { value: 'utensils', label: 'Restaurant', Icon: Utensils },
    { value: 'coffee', label: 'Coffee', Icon: Coffee },
    { value: 'pizza', label: 'Fast Food', Icon: Pizza },
    { value: 'ice-cream', label: 'Dessert', Icon: IceCream },
    { value: 'wine', label: 'Drinks', Icon: Wine },
  ],
  Transportation: [
    { value: 'car', label: 'Car', Icon: Car },
    { value: 'fuel', label: 'Fuel', Icon: Fuel },
    { value: 'bus', label: 'Public Transport', Icon: Bus },
    { value: 'bike', label: 'Bike', Icon: Bike },
    { value: 'train', label: 'Train', Icon: Train },
    { value: 'plane', label: 'Flight', Icon: Plane },
  ],
  Shopping: [
    { value: 'shopping-cart', label: 'Groceries', Icon: ShoppingCart },
    { value: 'shirt', label: 'Clothing', Icon: Shirt },
    { value: 'gift', label: 'Gifts', Icon: Gift },
    { value: 'package', label: 'Online Shopping', Icon: Package },
  ],
  Entertainment: [
    { value: 'film', label: 'Movies', Icon: Film },
    { value: 'music', label: 'Music', Icon: Music },
    { value: 'gamepad2', label: 'Gaming', Icon: Gamepad2 },
    { value: 'camera', label: 'Photography', Icon: Camera },
    { value: 'palette', label: 'Art', Icon: Palette },
  ],
  'Health & Wellness': [
    { value: 'heart', label: 'Health', Icon: Heart },
    { value: 'dumbbell', label: 'Fitness', Icon: Dumbbell },
    { value: 'stethoscope', label: 'Medical', Icon: Stethoscope },
    { value: 'pill', label: 'Pharmacy', Icon: Pill },
  ],
  'Family & Personal': [
    { value: 'baby', label: 'Baby Care', Icon: Baby },
    { value: 'paw-print', label: 'Pet Care', Icon: PawPrint },
    { value: 'scissors', label: 'Personal Care', Icon: Scissors },
  ],
  'Work & Education': [
    { value: 'briefcase', label: 'Work', Icon: Briefcase },
    { value: 'book', label: 'Education', Icon: Book },
    { value: 'graduation-cap', label: 'Courses', Icon: GraduationCap },
    { value: 'laptop', label: 'Technology', Icon: Laptop },
    { value: 'smartphone', label: 'Phone', Icon: Smartphone },
    { value: 'monitor', label: 'Electronics', Icon: Monitor },
    { value: 'headphones', label: 'Audio', Icon: Headphones },
  ],
  'Utilities & Services': [
    { value: 'zap', label: 'Utilities', Icon: Zap },
    { value: 'phone', label: 'Phone Bill', Icon: Phone },
    { value: 'wrench', label: 'Maintenance', Icon: Wrench },
    { value: 'hard-hat', label: 'Construction', Icon: HardHat },
    { value: 'shield-check', label: 'Insurance', Icon: ShieldCheck },
  ],
  'Travel & Location': [
    { value: 'map-pin', label: 'Location', Icon: MapPin },
    { value: 'building', label: 'Accommodation', Icon: Building },
    { value: 'tree-pine', label: 'Nature', Icon: TreePine },
    { value: 'umbrella', label: 'Weather', Icon: Umbrella },
  ],
  'Time & Goals': [
    { value: 'calendar', label: 'Calendar', Icon: Calendar },
    { value: 'clock', label: 'Time', Icon: Clock },
    { value: 'target', label: 'Goals', Icon: Target },
    { value: 'award', label: 'Achievement', Icon: Award },
    { value: 'star', label: 'Favorites', Icon: Star },
    { value: 'crown', label: 'Premium', Icon: Crown },
    { value: 'gem', label: 'Luxury', Icon: Gem },
  ],
  Other: [
    { value: 'file-text', label: 'Documents', Icon: FileText },
    { value: 'sun', label: 'Day', Icon: Sun },
    { value: 'moon', label: 'Night', Icon: Moon },
    { value: 'cloud', label: 'Cloud', Icon: Cloud },
    { value: 'more-horizontal', label: 'Other', Icon: MoreHorizontal },
  ],
};

const IconSelector: FC<IconSelectorProps> = ({ selectedIcon, onIconSelect, className = '' }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Flatten all icons for search
  const allIcons = Object.values(iconCategories).flat();

  // Filter icons based on search
  const filteredIcons = searchTerm
    ? allIcons.filter(
        (icon) =>
          icon.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          icon.value.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : null;

  return (
    <div
      className={`bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden ${className}`}
    >
      {/* iOS-style search bar */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
            size={16}
          />
          <input
            type="text"
            placeholder="Search icons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-500 border-0 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-600 transition-all"
          />
        </div>
      </div>

      {/* iOS-style icon grid */}
      <div className="max-h-72 overflow-y-auto">
        {searchTerm ? (
          /* Search results */
          <div className="p-4">
            {filteredIcons && filteredIcons.length > 0 ? (
              <div className="grid grid-cols-6 gap-3">
                {filteredIcons.map((option) => {
                  const IconComponent = option.Icon;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => onIconSelect(option.value)}
                      className={`aspect-square flex items-center justify-center p-3 rounded-2xl border-2 transition-all duration-200 ${
                        selectedIcon === option.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-lg'
                          : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md active:scale-95'
                      }`}
                      title={option.label}
                    >
                      <IconComponent
                        size={20}
                        className={
                          selectedIcon === option.value
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-400'
                        }
                      />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Search className="mx-auto mb-2" size={24} />
                <p className="text-sm">No icons found</p>
              </div>
            )}
          </div>
        ) : (
          /* Category view */
          Object.entries(iconCategories).map(([categoryName, icons]) => (
            <div
              key={categoryName}
              className="border-b border-gray-100 dark:border-gray-700 last:border-b-0"
            >
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50">
                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-400 uppercase tracking-wider">
                  {categoryName}
                </h4>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-6 gap-3">
                  {icons.map((option) => {
                    const IconComponent = option.Icon;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => onIconSelect(option.value)}
                        className={`aspect-square flex items-center justify-center p-3 rounded-2xl border-2 transition-all duration-200 ${
                          selectedIcon === option.value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-lg transform scale-105'
                            : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md active:scale-95'
                        }`}
                        title={option.label}
                      >
                        <IconComponent
                          size={20}
                          className={
                            selectedIcon === option.value
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-gray-600 dark:text-gray-400'
                          }
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default IconSelector;

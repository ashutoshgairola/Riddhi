// src/components/transactions/TransactionFilters.tsx
import { FC, useState } from "react";
import { Search, Filter, X } from "lucide-react";
import {
  TransactionFilters as FilterType,
  TransactionType,
} from "../../types/transaction.types";

interface TransactionFiltersProps {
  filters: FilterType;
  onFilterChange: (filters: FilterType) => void;
}

const TransactionFilters: FC<TransactionFiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      searchTerm: e.target.value,
    });
  };

  const handleTypeChange = (type: TransactionType) => {
    const currentTypes = filters.types || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type];

    onFilterChange({
      ...filters,
      types: newTypes.length > 0 ? newTypes : undefined,
    });
  };

  const handleClearFilters = () => {
    onFilterChange({
      startDate: undefined,
      endDate: undefined,
      types: undefined,
      searchTerm: "",
    });
  };

  const toggleAdvancedFilters = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search transactions..."
            className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={filters.searchTerm || ""}
            onChange={handleSearchChange}
          />
        </div>

        <div className="flex gap-2">
          <button
            className={`px-4 py-2 rounded-lg border ${
              showAdvancedFilters
                ? "bg-gray-100 border-gray-300"
                : "border-gray-200"
            } transition-colors flex items-center gap-2`}
            onClick={toggleAdvancedFilters}
          >
            <Filter size={18} />
            <span>Filters</span>
          </button>

          {(filters.types?.length || filters.startDate || filters.endDate) && (
            <button
              className="px-4 py-2 rounded-lg border border-gray-200 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
              onClick={handleClearFilters}
            >
              <X size={18} />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {showAdvancedFilters && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transaction Type
              </label>
              <div className="flex gap-2">
                <button
                  className={`px-3 py-1 rounded-full text-sm ${
                    filters.types?.includes("income")
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                  onClick={() => handleTypeChange("income")}
                >
                  Income
                </button>
                <button
                  className={`px-3 py-1 rounded-full text-sm ${
                    filters.types?.includes("expense")
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                  onClick={() => handleTypeChange("expense")}
                >
                  Expense
                </button>
                <button
                  className={`px-3 py-1 rounded-full text-sm ${
                    filters.types?.includes("transfer")
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                  onClick={() => handleTypeChange("transfer")}
                >
                  Transfer
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  className="px-3 py-2 rounded-lg border border-gray-200"
                  value={filters.startDate || ""}
                  onChange={(e) =>
                    onFilterChange({
                      ...filters,
                      startDate: e.target.value || undefined,
                    })
                  }
                />
                <input
                  type="date"
                  className="px-3 py-2 rounded-lg border border-gray-200"
                  value={filters.endDate || ""}
                  onChange={(e) =>
                    onFilterChange({
                      ...filters,
                      endDate: e.target.value || undefined,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Advanced
              </label>
              <button className="w-full px-3 py-2 border border-gray-200 rounded-lg text-left text-gray-500">
                More filters...
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionFilters;

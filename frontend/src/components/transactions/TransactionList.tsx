// src/components/transactions/TransactionList.tsx
import { FC, useState } from "react";
import { Edit2, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import {
  Transaction,
  TransactionCategory,
} from "../../types/transaction.types";

interface TransactionListProps {
  transactions: Transaction[];
}

// Dummy categories data
const categories: Record<string, TransactionCategory> = {
  "1": { id: "1", name: "Housing", color: "#4CAF50" },
  "2": { id: "2", name: "Income", color: "#2196F3" },
  "3": { id: "3", name: "Dining", color: "#FFC107" },
  "4": { id: "4", name: "Utilities", color: "#FF5722" },
  "5": { id: "5", name: "Fitness", color: "#9C27B0" },
  "6": { id: "6", name: "Freelance", color: "#3F51B5" },
  "7": { id: "7", name: "Entertainment", color: "#E91E63" },
  "8": { id: "8", name: "Shopping", color: "#607D8B" },
};

interface TransactionItemProps {
  transaction: Transaction;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  toggleDetails: (id: string) => void;
  showDetails: boolean;
}

const TransactionItem: FC<TransactionItemProps> = ({
  transaction,
  onEdit,
  onDelete,
  toggleDetails,
  showDetails,
}) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const category = categories[transaction.categoryId];

  return (
    <div className="border border-gray-200 rounded-lg mb-2 overflow-hidden">
      <div
        className="p-4 bg-white flex justify-between items-center cursor-pointer hover:bg-gray-50"
        onClick={() => toggleDetails(transaction.id)}
      >
        <div className="flex items-center">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center mr-4"
            style={{
              backgroundColor: category?.color
                ? `${category.color}20`
                : "#e0e0e0",
            }}
          >
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: category?.color || "#9e9e9e" }}
            ></span>
          </div>

          <div>
            <p className="font-medium">{transaction.description}</p>
            <p className="text-sm text-gray-500">
              {formatDate(transaction.date)} •{" "}
              {category?.name || "Uncategorized"}
            </p>
          </div>
        </div>

        <div className="flex items-center">
          <p
            className={`font-medium mr-4 ${
              transaction.type === "income" ? "text-green-600" : "text-red-600"
            }`}
          >
            {transaction.type === "income" ? "+" : "-"}
            {formatCurrency(transaction.amount)}
          </p>

          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(transaction.id);
            }}
          >
            <Edit2 size={18} />
          </button>

          <button
            className="text-gray-400 hover:text-red-600 ml-2"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(transaction.id);
            }}
          >
            <Trash2 size={18} />
          </button>

          <div className="ml-2">
            {showDetails ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Category</p>
              <p>{category?.name || "Uncategorized"}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Account</p>
              <p>Main Checking Account</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Status</p>
              <p className="capitalize">{transaction.status}</p>
            </div>

            {transaction.notes && (
              <div className="col-span-3">
                <p className="text-sm text-gray-500 mb-1">Notes</p>
                <p>{transaction.notes}</p>
              </div>
            )}

            {transaction.tags && transaction.tags.length > 0 && (
              <div className="col-span-3">
                <p className="text-sm text-gray-500 mb-1">Tags</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {transaction.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const TransactionList: FC<TransactionListProps> = ({ transactions }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleEditTransaction = (id: string) => {
    console.log("Edit transaction", id);
    // Handle edit logic here
  };

  const handleDeleteTransaction = (id: string) => {
    console.log("Delete transaction", id);
    // Handle delete logic here
  };

  const toggleDetails = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-medium">
          {transactions.length} Transactions
        </h2>

        <div className="flex items-center">
          <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm mr-2">
            <option>Sort by Date</option>
            <option>Sort by Amount</option>
            <option>Sort by Category</option>
          </select>

          <button className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
            Export
          </button>
        </div>
      </div>

      <div className="p-4">
        {transactions.length > 0 ? (
          transactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
              toggleDetails={toggleDetails}
              showDetails={expandedId === transaction.id}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionList;

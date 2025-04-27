// src/components/settings/AccountConnectionCard.tsx
import { FC } from "react";
import { RefreshCw, Link as LinkIcon } from "lucide-react";

interface AccountConnectionCardProps {
  name: string;
  type: string;
  isConnected: boolean;
  lastUpdated?: string;
  logo?: string;
}

const AccountConnectionCard: FC<AccountConnectionCardProps> = ({
  name,
  type,
  isConnected,
  lastUpdated,
  logo,
}) => {
  const formatLastUpdated = (dateString?: string): string => {
    if (!dateString) return "Never";

    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-4">
          {logo ? (
            <img src={logo} alt={name} className="w-8 h-8 object-contain" />
          ) : (
            <LinkIcon size={20} className="text-gray-600" />
          )}
        </div>

        <div>
          <h3 className="font-medium">{name}</h3>
          <div className="flex items-center text-sm text-gray-500">
            <span className="mr-2">{type}</span>
            {isConnected && (
              <>
                <span className="mx-2">•</span>
                <span>Last updated: {formatLastUpdated(lastUpdated)}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div>
        {isConnected ? (
          <div className="flex space-x-2">
            <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full">
              <RefreshCw size={16} />
            </button>
            <button className="px-3 py-1 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
              Disconnect
            </button>
          </div>
        ) : (
          <button className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
            Connect
          </button>
        )}
      </div>
    </div>
  );
};

export default AccountConnectionCard;

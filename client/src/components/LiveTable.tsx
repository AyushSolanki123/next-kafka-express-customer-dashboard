import React from "react";
import { CustomerData } from "../types";

interface LiveTableProps {
  data: CustomerData[];
}

const LiveTable: React.FC<LiveTableProps> = ({ data }) => {
  return (
    <div className="rounded-lg overflow-hidden border border-gray-200">
      <div className="bg-gray-100 px-4 py-3 border-b">
        <h3 className="text-lg font-semibold text-black">
          Live Customer Traffic
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Store ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customers In
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customers Out
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Net Change
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((entry, index) => (
              <tr key={index} className={index === 0 ? "bg-green-50" : ""}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {entry.time_stamp &&
                    new Date(entry.time_stamp)
                      .toUTCString()
                      .replace(
                        /^\w+, (\d{2}) (\w{3}) (\d{4}) (\d{2}:\d{2}:\d{2}).*$/,
                        "$1 $2 $3 $4"
                      )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {entry.store_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {entry.customers_in > 0 ? (
                    <span className="text-green-600">
                      +{entry.customers_in}
                    </span>
                  ) : (
                    entry.customers_in
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {entry.customers_out > 0 ? (
                    <span className="text-red-600">-{entry.customers_out}</span>
                  ) : (
                    entry.customers_out
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`${
                      entry.customers_in - entry.customers_out > 0
                        ? "text-green-600"
                        : entry.customers_in - entry.customers_out < 0
                        ? "text-red-600"
                        : "text-gray-500"
                    }`}
                  >
                    {entry.customers_in - entry.customers_out > 0 && "+"}
                    {entry.customers_in - entry.customers_out}
                  </span>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LiveTable;

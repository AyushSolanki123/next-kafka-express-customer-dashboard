import React from "react";
import { HourlyCustomerData } from "../types";

interface HistoryTableProps {
  data: HourlyCustomerData[];
}

const HistoryTable: React.FC<HistoryTableProps> = ({ data }) => {
  return (
    <div className="rounded-lg overflow-hidden border border-gray-200">
      <div className="bg-gray-100 px-4 py-3 border-b">
        <h3 className="text-lg font-semibold text-black">
          Historical Customer Traffic (Last 24 Hours)
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hour
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
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {entry.hour}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {entry.customers_in}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {entry.customers_out}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`${
                      entry.net_change > 0
                        ? "text-green-600"
                        : entry.net_change < 0
                        ? "text-red-600"
                        : "text-gray-500"
                    }`}
                  >
                    {entry.net_change > 0 && "+"}
                    {entry.net_change}
                  </span>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No historical data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryTable;

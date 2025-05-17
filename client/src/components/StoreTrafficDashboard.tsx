import React, { useState, useEffect } from "react";
import LiveTable from "./LiveTable";
import HistoryTable from "./HistoryTable";
import { CustomerData, HourlyCustomerData } from "../types";
import {
  initializeSocket,
  disconnectSocket,
  fetchHourlyData,
  fetchRecentTraffic,
} from "../services/api";

const StoreTrafficDashboard: React.FC = () => {
  const [liveData, setLiveData] = useState<CustomerData[]>([]);
  const [historicalData, setHistoricalData] = useState<HourlyCustomerData[]>(
    []
  );
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  // Load initial data and set up socket connection
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Fetch recent traffic for the live table
        const recentData = await fetchRecentTraffic(10);
        setLiveData(recentData);

        // Fetch hourly data for the historical table
        const hourlyData = await fetchHourlyData();
        setHistoricalData(hourlyData);

        // Calculate initial total customers from hourly data
        const netCustomers = hourlyData.reduce(
          (acc, curr) => acc + curr.net_change,
          0
        );
        setTotalCustomers(netCustomers);

        // Set up Socket.IO connection for real-time updates
        const socket = initializeSocket((data: CustomerData) => {
          setLiveData((prev) => {
            // Add the new entry to the top of the list
            const updatedData = [data, ...prev.slice(0, 9)];
            return updatedData;
          });

          // Update total customer count
          setTotalCustomers(
            (prev) => prev + (data.customers_in - data.customers_out)
          );
        });

        socket.on("connect", () => {
          setIsConnected(true);
        });

        socket.on("disconnect", () => {
          setIsConnected(false);
        });
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };

    loadInitialData();

    // Clean up socket connection when component unmounts
    return () => {
      disconnectSocket();
    };
  }, []);

  // Separate useEffect for the hourly data interval
  useEffect(() => {
    let hourlyDataInterval: NodeJS.Timeout | null = null;

    if (isConnected) {
      hourlyDataInterval = setInterval(async () => {
        const hourlyData = await fetchHourlyData();
        setHistoricalData(hourlyData);
      }, 60 * 1000); // 60000ms = 1 minute
    }

    return () => {
      if (hourlyDataInterval) {
        clearInterval(hourlyDataInterval);
      }
    };
  }, [isConnected]);

  // Fallback to mock data if API fails
  useEffect(() => {
    // If after 5 seconds we still have no data, generate some mock data
    const timer = setTimeout(() => {
      if (liveData.length === 0) {
        import("../utils/mockData").then(
          ({ generateLiveData, generateHistoricalData }) => {
            // Get mock data for demonstration purposes
            const mockHistoricalData = generateHistoricalData();
            setHistoricalData(mockHistoricalData);

            // Calculate initial total from mock data
            const netCustomers = mockHistoricalData.reduce(
              (acc, curr) => acc + curr.net_change,
              0
            );
            setTotalCustomers(netCustomers);

            // Set up interval to generate mock live data
            const interval = setInterval(() => {
              const newEntry = generateLiveData();

              if (newEntry.customers_in > 0 || newEntry.customers_out > 0) {
                setLiveData((prev) => {
                  const updatedData = [newEntry, ...prev.slice(0, 9)];
                  return updatedData;
                });

                setTotalCustomers(
                  (prev) =>
                    prev + (newEntry.customers_in - newEntry.customers_out)
                );
              }
            }, 3000);

            return () => clearInterval(interval);
          }
        );
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [liveData]);

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2 text-black">
              Store Traffic Dashboard
            </h1>
            <p className="text-gray-600">
              Real-time monitoring of customer traffic
            </p>
          </div>
          <div className="text-sm flex items-center">
            <span
              className={`h-3 w-3 rounded-full mr-2 ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            ></span>
            <span className="text-black">
              {isConnected ? "Connected to server" : "Using mock data"}
            </span>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-blue-800">
                Current Store Status
              </h2>
              <p className="text-sm text-blue-600">Store ID: 10</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-blue-800">
                {totalCustomers}
              </p>
              <p className="text-sm text-blue-600">Total Customers In Store</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <LiveTable data={liveData} />
        </div>
        <div>
          <HistoryTable data={historicalData} />
        </div>
      </div>
    </div>
  );
};

export default StoreTrafficDashboard;

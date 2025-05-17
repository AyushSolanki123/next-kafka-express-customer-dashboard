import { CustomerData, HourlyCustomerData } from "../types";

// Generate mock data for live table
export const generateLiveData = (): CustomerData => {
  const customersIn = Math.floor(Math.random() * 3);
  const customersOut = Math.floor(Math.random() * 3);

  return {
    store_id: 10,
    customers_in: customersIn,
    customers_out: customersOut,
    time_stamp: new Date().toLocaleTimeString(),
  };
};

// Generate 24 hours of historical data
export const generateHistoricalData = (): HourlyCustomerData[] => {
  const now = new Date();
  const data: HourlyCustomerData[] = [];

  for (let i = 23; i >= 0; i--) {
    const hourDate = new Date(now);
    hourDate.setHours(now.getHours() - i);

    const customersIn = Math.floor(Math.random() * 20) + 5;
    const customersOut = Math.floor(Math.random() * 18) + 4;

    data.push({
      hour: hourDate.toLocaleTimeString([], { hour: "2-digit", hour12: true }),
      customers_in: customersIn,
      customers_out: customersOut,
      net_change: customersIn - customersOut,
    });
  }

  return data;
};

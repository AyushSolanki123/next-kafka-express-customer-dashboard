export interface CustomerData {
  store_id: number;
  customers_in: number;
  customers_out: number;
  time_stamp: string;
}

export interface HourlyCustomerData {
  hour: string;
  customers_in: number;
  customers_out: number;
  net_change: number;
}

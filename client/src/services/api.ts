import axios from "axios";
import { io, Socket } from "socket.io-client";
import { CustomerData, HourlyCustomerData } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8080";
let socket: Socket | null = null;

// Initialize Socket.IO connection
export const initializeSocket = (
  callback: (data: CustomerData) => void
): Socket => {
  if (!socket) {
    console.log(`Connecting to Socket.IO at: ${SOCKET_URL}`);
    socket = io(SOCKET_URL);

    socket.on("connect", () => {
      console.log("Connected to server via Socket.IO", socket?.id);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    socket.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error);
    });

    socket.on("welcome", (data) => {
      console.log("Received welcome message:", data);
    });
  }

  // Set up event listener for customer traffic events
  socket.on("customer-traffic", (data: CustomerData) => {
    console.log("Received customer traffic event:", data);
    callback(data);
  });

  return socket;
};

// Disconnect Socket.IO
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Check API status
export const checkApiStatus = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${SOCKET_URL}/api/status`);
    console.log("API status:", response.data);
    return true;
  } catch (error) {
    console.error("API status check failed:", error);
    return false;
  }
};

// Fetch historical hourly data
export const fetchHourlyData = async (): Promise<HourlyCustomerData[]> => {
  try {
    console.log(`Fetching hourly data from: ${API_URL}/traffic/hourly`);
    const response = await axios.get(`${API_URL}/traffic/hourly`);
    console.log("Hourly data response:", response.data);

    if (
      response.data &&
      response.data.success &&
      Array.isArray(response.data.data)
    ) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching hourly data:", error);
    return [];
  }
};

// Fetch recent traffic events
export const fetchRecentTraffic = async (
  limit: number = 10
): Promise<CustomerData[]> => {
  try {
    console.log(
      `Fetching recent traffic from: ${API_URL}/traffic/recent?limit=${limit}`
    );
    const response = await axios.get(`${API_URL}/traffic/recent`, {
      params: { limit },
    });
    console.log("Recent traffic response:", response.data);

    if (
      response.data &&
      response.data.success &&
      Array.isArray(response.data.data)
    ) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching recent traffic:", error);
    return [];
  }
};

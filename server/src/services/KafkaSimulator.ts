import { Server as SocketIOServer } from "socket.io";
import CustomerTraffic, { ICustomerTraffic } from "../models/CustomerTraffic";

/**
 * Service to simulate Kafka events and emit them via Socket.IO
 */
export class KafkaSimulator {
  private io: SocketIOServer;
  private intervalId: NodeJS.Timeout | null = null;
  private stores: number[] = [10]; // Store IDs to simulate traffic for
  private dbConnected: boolean = true;
  private storeOccupancy: Map<number, number> = new Map(); // Track customers in each store

  constructor(io: SocketIOServer) {
    this.io = io;

    // Initialize store occupancy
    this.stores.forEach((storeId) => {
      this.storeOccupancy.set(storeId, 0);
    });

    // Check MongoDB connection
    const mongoose = require("mongoose");
    mongoose.connection.on("error", () => {
      console.log(
        "MongoDB connection lost. KafkaSimulator will emit events but not save to DB."
      );
      this.dbConnected = false;
    });

    mongoose.connection.on("connected", () => {
      console.log(
        "MongoDB connection established. KafkaSimulator will save events to DB."
      );
      this.dbConnected = true;
      this.initializeStoreOccupancy();
    });
  }

  /**
   * Initialize store occupancy counts from database
   */
  private async initializeStoreOccupancy(): Promise<void> {
    try {
      for (const storeId of this.stores) {
        const inCount = await CustomerTraffic.aggregate([
          { $match: { store_id: storeId } },
          { $group: { _id: null, total: { $sum: "$customers_in" } } },
        ]);

        const outCount = await CustomerTraffic.aggregate([
          { $match: { store_id: storeId } },
          { $group: { _id: null, total: { $sum: "$customers_out" } } },
        ]);

        const totalIn = inCount.length > 0 ? inCount[0].total : 0;
        const totalOut = outCount.length > 0 ? outCount[0].total : 0;

        this.storeOccupancy.set(storeId, Math.max(0, totalIn - totalOut));
      }
      console.log(
        "Store occupancy initialized:",
        Object.fromEntries(this.storeOccupancy)
      );
    } catch (error) {
      console.error("Error initializing store occupancy:", error);
    }
  }

  /**
   * Start generating events at a specified interval
   * @param interval Time in ms between events
   */
  public start(interval: number = 2000): void {
    if (this.intervalId) {
      return;
    }

    this.intervalId = setInterval(() => {
      this.generateAndEmitEvent();
    }, interval);

    console.log(`Kafka simulator started with ${interval}ms interval`);
  }

  /**
   * Stop generating events
   */
  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("Kafka simulator stopped");
    }
  }

  /**
   * Generate random customer traffic data and emit it
   */
  private async generateAndEmitEvent(): Promise<void> {
    // Generate random data - this simulates a Kafka message
    const storeId = this.stores[Math.floor(Math.random() * this.stores.length)];
    const currentOccupancy = this.storeOccupancy.get(storeId) || 0;

    // Generate values with higher probability of zero to make the data more realistic
    const customersIn = this.generateRandomWithZeroWeight(3);

    // Make sure we don't have more customers leaving than are in the store
    const maxPossibleOut = Math.min(currentOccupancy, 3);
    let customersOut = 0;

    if (maxPossibleOut > 0) {
      customersOut = this.generateRandomWithZeroWeight(maxPossibleOut);
    }

    // Only emit if there's actual activity (customers in or out)
    if (customersIn === 0 && customersOut === 0) {
      return;
    }

    // Update store occupancy
    this.storeOccupancy.set(
      storeId,
      currentOccupancy + customersIn - customersOut
    );

    const eventData = {
      store_id: storeId,
      customers_in: customersIn,
      customers_out: customersOut,
      time_stamp: new Date().toISOString(),
    };

    try {
      // Save to database if connected
      if (this.dbConnected) {
        try {
          const trafficEvent = new CustomerTraffic({
            store_id: eventData.store_id,
            customers_in: eventData.customers_in,
            customers_out: eventData.customers_out,
            time_stamp: new Date(eventData.time_stamp),
          });

          await trafficEvent.save();
        } catch (dbError) {
          console.error("Error saving to database:", dbError);
          this.dbConnected = false;
        }
      }

      // Always emit to all connected clients, even if DB save failed
      this.io.emit("customer-traffic", eventData);
      console.log("Emitted event:", eventData);
    } catch (error) {
      console.error("Error emitting event:", error);
    }
  }

  /**
   * Generate a random number with higher probability of zero
   */
  private generateRandomWithZeroWeight(max: number): number {
    // 60% chance of returning 0
    if (Math.random() < 0.6) {
      return 0;
    }

    // Otherwise return a random number between 1 and max
    return Math.floor(Math.random() * max) + 1;
  }
}

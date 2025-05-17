import { Request, Response } from "express";
import CustomerTraffic from "../models/CustomerTraffic";

/**
 * Get the last 24 hours of customer traffic data aggregated by hour
 */
export const getHourlyTraffic = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Get data for the last 24 hours
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // Using MongoDB aggregation to get hourly data
    const hourlyData = await CustomerTraffic.aggregate([
      {
        $match: {
          time_stamp: { $gte: twentyFourHoursAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$time_stamp" },
            month: { $month: "$time_stamp" },
            day: { $dayOfMonth: "$time_stamp" },
            hour: { $hour: "$time_stamp" },
          },
          customers_in: { $sum: "$customers_in" },
          customers_out: { $sum: "$customers_out" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          day: "$_id.day",
          hour: "$_id.hour",
          customers_in: 1,
          customers_out: 1,
          net_change: { $subtract: ["$customers_in", "$customers_out"] },
          count: 1,
        },
      },
      {
        $sort: { year: 1, month: 1, day: 1, hour: 1 },
      },
    ]);

    // Format the response
    const formattedData = hourlyData.map((item) => {
      const date = new Date(item.year, item.month - 1, item.day, item.hour);
      return {
        hour: date.toLocaleTimeString([], { hour: "2-digit", hour12: true }),
        customers_in: item.customers_in,
        customers_out: item.customers_out,
        net_change: item.net_change,
      };
    });

    res.status(200).json({
      success: true,
      count: formattedData.length,
      data: formattedData,
    });
  } catch (error) {
    console.error("Error fetching hourly traffic:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

/**
 * Get the most recent customer traffic events
 */
export const getRecentTraffic = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const recentTraffic = await CustomerTraffic.find()
      .sort({ time_stamp: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      count: recentTraffic.length,
      data: recentTraffic,
    });
  } catch (error) {
    console.error("Error fetching recent traffic:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

import express from "express";
import {
  getHourlyTraffic,
  getRecentTraffic,
} from "../controllers/customerTrafficController";

const router = express.Router();

// GET /api/traffic/hourly - Get hourly traffic for the last 24 hours
router.get("/hourly", getHourlyTraffic);

// GET /api/traffic/recent - Get recent traffic events
router.get("/recent", getRecentTraffic);

export default router;

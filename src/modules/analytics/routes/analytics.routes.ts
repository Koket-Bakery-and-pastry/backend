import { Router } from "express";
import { analyticsController } from "../controllers/analytics.controller";

const router = Router();

// Dashboard overview
router.get("/dashboard", (req, res) =>
  analyticsController.getDashboardOverview(req, res)
);

// Analytics data with filters
router.get("/data", (req, res) =>
  analyticsController.getAnalyticsData(req, res)
);

// Product performance
router.get("/products/performance", (req, res) =>
  analyticsController.getProductPerformance(req, res)
);

// Category performance
router.get("/categories/performance", (req, res) =>
  analyticsController.getCategoryPerformance(req, res)
);

// Revenue trend
router.get("/revenue/trend", (req, res) =>
  analyticsController.getRevenueTrend(req, res)
);

// Custom orders analytics
router.get("/custom-orders", (req, res) =>
  analyticsController.getCustomOrdersAnalytics(req, res)
);

// Customer analytics
router.get("/customers", (req, res) =>
  analyticsController.getCustomerAnalytics(req, res)
);

// Generate snapshot (for cron jobs)
router.post("/snapshot/generate", (req, res) =>
  analyticsController.generateSnapshot(req, res)
);

export default router;

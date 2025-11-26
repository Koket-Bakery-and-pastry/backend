import { Router } from "express";
import { analyticsController } from "../controllers/analytics.controller";
import {
  authenticate,
  authorize,
} from "../../../core/middlewares/auth.middleware";

const router = Router();

// All analytics routes require admin authentication
// Dashboard overview
router.get("/dashboard", authenticate, authorize("admin"), (req, res) =>
  analyticsController.getDashboardOverview(req, res)
);

// Analytics data with filters
router.get("/data", authenticate, authorize("admin"), (req, res) =>
  analyticsController.getAnalyticsData(req, res)
);

// Product performance
router.get(
  "/products/performance",
  authenticate,
  authorize("admin"),
  (req, res) => analyticsController.getProductPerformance(req, res)
);

// Category performance
router.get(
  "/categories/performance",
  authenticate,
  authorize("admin"),
  (req, res) => analyticsController.getCategoryPerformance(req, res)
);

// Revenue trend
router.get("/revenue/trend", authenticate, authorize("admin"), (req, res) =>
  analyticsController.getRevenueTrend(req, res)
);

// Custom orders analytics
router.get("/custom-orders", authenticate, authorize("admin"), (req, res) =>
  analyticsController.getCustomOrdersAnalytics(req, res)
);

// Customer analytics
router.get("/customers", authenticate, authorize("admin"), (req, res) =>
  analyticsController.getCustomerAnalytics(req, res)
);

// Generate snapshot (for cron jobs - admin only)
router.post(
  "/snapshot/generate",
  authenticate,
  authorize("admin"),
  (req, res) => analyticsController.generateSnapshot(req, res)
);

export default router;

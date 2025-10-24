import { Request, Response } from "express";
import { analyticsService } from "../services/analytics.service";
import { getPayloadFromAuthHeader } from "../../../shared/utils/jwt";
import { analyticsQueryValidation } from "../validators/analytics.validator";

export class AnalyticsController {
  async getDashboardOverview(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization || "";
      const payload = getPayloadFromAuthHeader(authHeader);

      if (!payload || payload.role !== "admin") {
        res.status(403).json({ message: "Forbidden: Admin access required" });
        return;
      }

      const overview = await analyticsService.getDashboardOverview();
      res.status(200).json(overview);
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }

  async getAnalyticsData(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization || "";
      const payload = getPayloadFromAuthHeader(authHeader);

      if (!payload || payload.role !== "admin") {
        res.status(403).json({ message: "Forbidden: Admin access required" });
        return;
      }

      const parseResult = analyticsQueryValidation.safeParse(req.query);
      if (!parseResult.success) {
        res
          .status(400)
          .json({
            message: `Validation error: ${parseResult.error[0].message}`,
          });
        return;
      }

      const analyticsData = await analyticsService.getAnalyticsData(
        parseResult.data
      );
      res.status(200).json(analyticsData);
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }

  async getProductPerformance(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization || "";
      const payload = getPayloadFromAuthHeader(authHeader);

      if (!payload || payload.role !== "admin") {
        res.status(403).json({ message: "Forbidden: Admin access required" });
        return;
      }

      const { product_id } = req.query;
      const performance = await analyticsService.getProductPerformance(
        product_id as string
      );
      res.status(200).json(performance);
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }

  async getCategoryPerformance(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization || "";
      const payload = getPayloadFromAuthHeader(authHeader);

      if (!payload || payload.role !== "admin") {
        res.status(403).json({ message: "Forbidden: Admin access required" });
        return;
      }

      const performance = await analyticsService.getCategoryPerformance();
      res.status(200).json(performance);
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }

  async getRevenueTrend(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization || "";
      const payload = getPayloadFromAuthHeader(authHeader);

      if (!payload || payload.role !== "admin") {
        res.status(403).json({ message: "Forbidden: Admin access required" });
        return;
      }

      const parseResult = analyticsQueryValidation.safeParse(req.query);
      if (!parseResult.success) {
        res
          .status(400)
          .json({
            message: `Validation error: ${parseResult.error[0].message}`,
          });
        return;
      }

      const trend = await analyticsService.getRevenueTrend(parseResult.data);
      res.status(200).json(trend);
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }

  async getCustomOrdersAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization || "";
      const payload = getPayloadFromAuthHeader(authHeader);

      if (!payload || payload.role !== "admin") {
        res.status(403).json({ message: "Forbidden: Admin access required" });
        return;
      }

      const parseResult = analyticsQueryValidation.safeParse(req.query);
      if (!parseResult.success) {
        res
          .status(400)
          .json({
            message: `Validation error: ${parseResult.error[0].message}`,
          });
        return;
      }

      const analytics = await analyticsService.getCustomOrdersAnalytics(
        parseResult.data
      );
      res.status(200).json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }

  async getCustomerAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization || "";
      const payload = getPayloadFromAuthHeader(authHeader);

      if (!payload || payload.role !== "admin") {
        res.status(403).json({ message: "Forbidden: Admin access required" });
        return;
      }

      const parseResult = analyticsQueryValidation.safeParse(req.query);
      if (!parseResult.success) {
        res
          .status(400)
          .json({
            message: `Validation error: ${parseResult.error[0].message}`,
          });
        return;
      }

      const analytics = await analyticsService.getCustomerAnalytics(
        parseResult.data
      );
      res.status(200).json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }

  async generateSnapshot(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization || "";
      const payload = getPayloadFromAuthHeader(authHeader);

      if (!payload || payload.role !== "admin") {
        res.status(403).json({ message: "Forbidden: Admin access required" });
        return;
      }

      await analyticsService.generateDailySnapshot();
      res
        .status(200)
        .json({ message: "Analytics snapshot generated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }
}

export const analyticsController = new AnalyticsController();

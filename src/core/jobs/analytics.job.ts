import { analyticsService } from "../../modules/analytics/services/analytics.service";
import cron from "node-cron";

export class AnalyticsJobs {
  static initialize(): void {
    // Generate daily analytics snapshot at midnight
    cron.schedule("0 0 * * *", async () => {
      try {
        console.log("Generating daily analytics snapshot...");
        await analyticsService.generateDailySnapshot();
        console.log("Daily analytics snapshot generated successfully");
      } catch (error) {
        console.error("Error generating daily analytics snapshot:", error);
      }
    });

    console.log("Analytics jobs initialized");
  }
}

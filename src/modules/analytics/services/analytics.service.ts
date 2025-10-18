import { analyticsRepository } from "../repositories/analytics.repository";
import {
  AnalyticsQueryDTO,
  AnalyticsResponseDTO,
  DashboardOverviewDTO,
  ProductPerformanceDTO,
  CategoryPerformanceDTO,
} from "../dtos/analytics.dto";

export class AnalyticsService {
  async getDashboardOverview(): Promise<DashboardOverviewDTO> {
    return await analyticsRepository.getDashboardOverview();
  }

  async getAnalyticsData(
    query: AnalyticsQueryDTO
  ): Promise<AnalyticsResponseDTO> {
    const startDate =
      query.start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default 30 days
    const endDate = query.end_date || new Date();

    return await analyticsRepository.getAnalyticsData(startDate, endDate);
  }

  async getProductPerformance(
    productId?: string
  ): Promise<ProductPerformanceDTO[]> {
    return await analyticsRepository.getProductPerformance(productId);
  }

  async getCategoryPerformance(): Promise<CategoryPerformanceDTO[]> {
    // Implementation for category performance
    return (await analyticsRepository.getTopCategories(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      new Date()
    )) as CategoryPerformanceDTO[];
  }

  async getRevenueTrend(query: AnalyticsQueryDTO): Promise<any[]> {
    const startDate =
      query.start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = query.end_date || new Date();

    return await analyticsRepository.getRevenueTrend(startDate, endDate);
  }

  async generateDailySnapshot(): Promise<void> {
    await analyticsRepository.generateDailySnapshot();
  }

  async getCustomOrdersAnalytics(query: AnalyticsQueryDTO): Promise<any> {
    const startDate =
      query.start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = query.end_date || new Date();

    return await analyticsRepository.getCustomOrderAnalytics(
      startDate,
      endDate
    );
  }

  async getCustomerAnalytics(query: AnalyticsQueryDTO): Promise<any> {
    const startDate =
      query.start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = query.end_date || new Date();

    return await analyticsRepository.getCustomerAnalytics(startDate, endDate);
  }
}

export const analyticsService = new AnalyticsService();

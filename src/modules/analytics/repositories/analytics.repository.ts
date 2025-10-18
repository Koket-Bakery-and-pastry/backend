import { Types, FilterQuery } from "mongoose";
import Order from "../../../database/models/order.model";
import CustomOrder from "../../../database/models/customOrder.model";
import User from "../../../database/models/user.model";
import { AnalyticsQueryDTO } from "../dtos/analytics.dto";
import Product from "../../../database/models/product.model";
import Category from "../../../database/models/category.model";
import ProductReview from "../../../database/models/productReview.model";
import { AnalyticsSnapshot } from "../../../database/models/analytics.models";

export class AnalyticsRepository {
  async getDashboardOverview(): Promise<any> {
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(today.setDate(today.getDate() - 7));
    const startOfMonth = new Date(today.setMonth(today.getMonth() - 1));

    const [todayStats, weeklyStats, monthlyStats] = await Promise.all([
      this.getAnalyticsData(startOfToday, new Date()),
      this.getAnalyticsData(startOfWeek, new Date()),
      this.getAnalyticsData(startOfMonth, new Date()),
    ]);

    return {
      today: todayStats,
      weekly: weeklyStats,
      monthly: monthlyStats,
      comparison: await this.getGrowthComparison(startOfMonth, new Date()),
    };
  }

  async getAnalyticsData(startDate: Date, endDate: Date): Promise<any> {
    const [
      orderStats,
      customOrderStats,
      customerStats,
      ratingStats,
      upcomingDeliveries,
    ] = await Promise.all([
      this.getOrderAnalytics(startDate, endDate),
      this.getCustomOrderAnalytics(startDate, endDate),
      this.getCustomerAnalytics(startDate, endDate),
      this.getRatingAnalytics(startDate, endDate),
      this.getUpcomingDeliveries(endDate),
    ]);

    const totalOrders = orderStats.total_orders + customOrderStats.total_orders;
    const totalRevenue =
      orderStats.total_revenue + customOrderStats.total_revenue;
    const totalUpfront =
      orderStats.total_upfront + customOrderStats.total_upfront;

    return {
      total_orders: totalOrders,
      total_revenue: totalRevenue,
      total_upfront_collected: totalUpfront,
      orders_by_status: this.mergeOrderStatuses(
        orderStats.orders_by_status,
        customOrderStats.orders_by_status
      ),
      top_categories: await this.getTopCategories(startDate, endDate),
      top_products: await this.getTopProducts(startDate, endDate),
      customer_metrics: customerStats,
      average_rating: ratingStats.average_rating,
      upcoming_deliveries: upcomingDeliveries,
      revenue_trend: await this.getRevenueTrend(startDate, endDate),
    };
  }

  async getOrderAnalytics(startDate: Date, endDate: Date): Promise<any> {
    const orders = await Order.aggregate([
      {
        $match: {
          created_at: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$total_price" },
          totalUpfront: { $sum: "$upfront_paid" },
        },
      },
    ]);

    const statusCounts = {
      pending: 0,
      accepted: 0,
      rejected: 0,
      completed: 0,
    };

    let totalRevenue = 0;
    let totalUpfront = 0;
    let totalOrders = 0;

    orders.forEach((order) => {
      statusCounts[order._id] = order.count;
      totalRevenue += order.totalRevenue;
      totalUpfront += order.totalUpfront;
      totalOrders += order.count;
    });

    return {
      total_orders: totalOrders,
      total_revenue: totalRevenue,
      total_upfront: totalUpfront,
      orders_by_status: statusCounts,
    };
  }

  async getCustomOrderAnalytics(startDate: Date, endDate: Date): Promise<any> {
    const customOrders = await CustomOrder.aggregate([
      {
        $match: {
          created_at: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$total_price" },
          totalUpfront: { $sum: "$upfront_paid" },
        },
      },
    ]);

    const statusCounts = {
      pending: 0,
      accepted: 0,
      rejected: 0,
      completed: 0,
    };

    let totalRevenue = 0;
    let totalUpfront = 0;
    let totalOrders = 0;

    customOrders.forEach((order) => {
      statusCounts[order._id] = order.count;
      totalRevenue += order.totalRevenue;
      totalUpfront += order.totalUpfront;
      totalOrders += order.count;
    });

    return {
      total_orders: totalOrders,
      total_revenue: totalRevenue,
      total_upfront: totalUpfront,
      orders_by_status: statusCounts,
    };
  }

  async getCustomerAnalytics(startDate: Date, endDate: Date): Promise<any> {
    const customerData = await Order.aggregate([
      {
        $match: {
          created_at: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$user_id",
          orderCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
    ]);

    const totalCustomers = customerData.length;
    const newCustomers = await User.countDocuments({
      created_at: { $gte: startDate, $lte: endDate },
    });

    const returningCustomers = totalCustomers - newCustomers;

    return {
      new_customers: newCustomers,
      returning_customers: Math.max(0, returningCustomers),
      total_customers: totalCustomers,
    };
  }

  async getRatingAnalytics(startDate: Date, endDate: Date): Promise<any> {
    const ratingData = await ProductReview.aggregate([
      {
        $match: {
          created_at: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    return {
      average_rating: ratingData.length > 0 ? ratingData[0].averageRating : 0,
      total_reviews: ratingData.length > 0 ? ratingData[0].totalReviews : 0,
    };
  }

  async getUpcomingDeliveries(endDate: Date): Promise<number> {
    const tomorrow = new Date(endDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const nextWeek = new Date(tomorrow);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const [regularOrders, customOrders] = await Promise.all([
      Order.countDocuments({
        delivery_time: { $gte: tomorrow, $lte: nextWeek },
        status: { $in: ["pending", "accepted"] },
      }),
      CustomOrder.countDocuments({
        delivery_time: { $gte: tomorrow, $lte: nextWeek },
        status: { $in: ["pending", "accepted"] },
      }),
    ]);

    return regularOrders + customOrders;
  }

  mergeOrderStatuses(regularOrders: any, customOrders: any): any {
    return {
      pending: (regularOrders.pending || 0) + (customOrders.pending || 0),
      accepted: (regularOrders.accepted || 0) + (customOrders.accepted || 0),
      rejected: (regularOrders.rejected || 0) + (customOrders.rejected || 0),
      completed: (regularOrders.completed || 0) + (customOrders.completed || 0),
    };
  }

  async getTopCategories(startDate: Date, endDate: Date): Promise<any[]> {
    return await Order.aggregate([
      {
        $match: {
          created_at: { $gte: startDate, $lte: endDate },
          status: { $in: ["accepted", "completed"] },
        },
      },
      {
        $lookup: {
          from: "orderitems",
          localField: "order_items",
          foreignField: "_id",
          as: "order_items_details",
        },
      },
      {
        $unwind: "$order_items_details",
      },
      {
        $lookup: {
          from: "products",
          localField: "order_items_details.product_id",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
      {
        $lookup: {
          from: "categories",
          localField: "product.category_id",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $group: {
          _id: "$category._id",
          category_name: { $first: "$category.name" },
          order_count: { $sum: 1 },
          revenue: { $sum: "$order_items_details.price" },
        },
      },
      {
        $sort: { revenue: -1 },
      },
      {
        $limit: 10,
      },
      {
        $project: {
          category_id: "$_id",
          category_name: 1,
          order_count: 1,
          revenue: 1,
          _id: 0,
        },
      },
    ]);
  }

  async getTopProducts(startDate: Date, endDate: Date): Promise<any[]> {
    const productPerformance = await Order.aggregate([
      {
        $match: {
          created_at: { $gte: startDate, $lte: endDate },
          status: { $in: ["accepted", "completed"] },
        },
      },
      {
        $lookup: {
          from: "orderitems",
          localField: "order_items",
          foreignField: "_id",
          as: "order_items_details",
        },
      },
      {
        $unwind: "$order_items_details",
      },
      {
        $lookup: {
          from: "products",
          localField: "order_items_details.product_id",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
      {
        $group: {
          _id: "$product._id",
          product_name: { $first: "$product.name" },
          order_count: { $sum: 1 },
          revenue: { $sum: "$order_items_details.price" },
        },
      },
      {
        $sort: { revenue: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    // Get average ratings for each product
    const productIds = productPerformance.map((p) => p._id);
    const ratings = await ProductReview.aggregate([
      {
        $match: {
          product_id: { $in: productIds },
        },
      },
      {
        $group: {
          _id: "$product_id",
          average_rating: { $avg: "$rating" },
          review_count: { $sum: 1 },
        },
      },
    ]);

    const ratingMap = new Map();
    ratings.forEach((r) => ratingMap.set(r._id.toString(), r));

    return productPerformance.map((product) => ({
      product_id: product._id,
      product_name: product.product_name,
      order_count: product.order_count,
      revenue: product.revenue,
      average_rating:
        ratingMap.get(product._id.toString())?.average_rating || 0,
      review_count: ratingMap.get(product._id.toString())?.review_count || 0,
    }));
  }

  async getRevenueTrend(startDate: Date, endDate: Date): Promise<any[]> {
    return await Order.aggregate([
      {
        $match: {
          created_at: { $gte: startDate, $lte: endDate },
          status: { $in: ["accepted", "completed"] },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$created_at" },
          },
          revenue: { $sum: "$total_price" },
          orders: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          date: "$_id",
          revenue: 1,
          orders: 1,
          _id: 0,
        },
      },
    ]);
  }

  async getGrowthComparison(startDate: Date, endDate: Date): Promise<any> {
    const previousStart = new Date(startDate);
    const previousEnd = new Date(endDate);
    const daysDiff = Math.floor(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    previousStart.setDate(previousStart.getDate() - daysDiff);
    previousEnd.setDate(previousEnd.getDate() - daysDiff);

    const [currentStats, previousStats] = await Promise.all([
      this.getAnalyticsData(startDate, endDate),
      this.getAnalyticsData(previousStart, previousEnd),
    ]);

    const revenueGrowth =
      previousStats.total_revenue > 0
        ? ((currentStats.total_revenue - previousStats.total_revenue) /
            previousStats.total_revenue) *
          100
        : 0;

    const orderGrowth =
      previousStats.total_orders > 0
        ? ((currentStats.total_orders - previousStats.total_orders) /
            previousStats.total_orders) *
          100
        : 0;

    const customerGrowth =
      previousStats.customer_metrics.total_customers > 0
        ? ((currentStats.customer_metrics.total_customers -
            previousStats.customer_metrics.total_customers) /
            previousStats.customer_metrics.total_customers) *
          100
        : 0;

    return {
      revenue_growth: revenueGrowth,
      order_growth: orderGrowth,
      customer_growth: customerGrowth,
    };
  }

  async getProductPerformance(productId?: string): Promise<any[]> {
    const matchStage: any = {
      status: { $in: ["accepted", "completed"] },
    };

    if (productId) {
      matchStage["order_items_details.product_id"] = new Types.ObjectId(
        productId
      );
    }

    return await Order.aggregate([
      {
        $lookup: {
          from: "orderitems",
          localField: "order_items",
          foreignField: "_id",
          as: "order_items_details",
        },
      },
      {
        $unwind: "$order_items_details",
      },
      {
        $lookup: {
          from: "products",
          localField: "order_items_details.product_id",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
      {
        $match: matchStage,
      },
      {
        $group: {
          _id: "$product._id",
          product_name: { $first: "$product.name" },
          total_orders: { $sum: 1 },
          total_revenue: { $sum: "$order_items_details.price" },
        },
      },
      {
        $lookup: {
          from: "productreviews",
          localField: "_id",
          foreignField: "product_id",
          as: "reviews",
        },
      },
      {
        $addFields: {
          average_rating: { $avg: "$reviews.rating" },
          review_count: { $size: "$reviews" },
        },
      },
      {
        $sort: { total_revenue: -1 },
      },
      {
        $project: {
          product_id: "$_id",
          product_name: 1,
          total_orders: 1,
          total_revenue: 1,
          average_rating: 1,
          review_count: 1,
          conversion_rate: {
            $multiply: [{ $divide: ["$total_orders", 100] }, 100],
          },
        },
      },
    ]);
  }

  async generateDailySnapshot(): Promise<void> {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const analyticsData = await this.getAnalyticsData(startOfDay, endOfDay);

    await AnalyticsSnapshot.create({
      date: startOfDay,
      period: "daily",
      ...analyticsData,
    });
  }
}

export const analyticsRepository = new AnalyticsRepository();

// Orders routes placeholder.

import { Router } from "express";
import {
  OrderItemController,
  OrdersController,
} from "../controllers/orders.controller";
import multer from "multer";
const upload = multer({ dest: "temp/" }); // Temporary storage for uploaded files

const router = Router();
const ordersController = new OrdersController();
const orderItemController = new OrderItemController();
// Create a new order with file upload
router.post("/", upload.single("payment_proof_file"), (req, res) =>
  ordersController.createOrder(req, res)
);

// Get orders for user
router.get("/user", (req, res) => ordersController.getOrdersByUserId(req, res));

// Get order by ID
router.get("/:id", (req, res) => ordersController.getOrderById(req, res));
// Update order by ID
router.put("/:id", (req, res) => ordersController.updateOrder(req, res));

// Get all orders
router.get("/", (req, res) => ordersController.getAllOrders(req, res));

// Filter orders by status
router.get("/filter/status", (req, res) =>
  ordersController.filterOrdersByStatus(req, res)
);

// OrderItem routes
// Get order items by user ID
router.get("/items/user", (req, res) =>
  orderItemController.getOrderItemsByUserId(req, res)
);

// Create a new order item
router.post("/items", (req, res) =>
  orderItemController.createOrderItem(req, res)
);

// Update an order item by ID
router.put("/items/:id", (req, res) =>
  orderItemController.updateOrderItem(req, res)
);

// Delete an order item by ID
router.delete("/items/:id", (req, res) =>
  orderItemController.deleteOrderItem(req, res)
);
export default router;

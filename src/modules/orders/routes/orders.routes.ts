// Orders routes placeholder.

import { Router } from "express";
import {
  OrderItemController,
  OrdersController,
} from "../controllers/orders.controller";
import multer from "multer";
import path from "path";
import {
  authenticate,
  authorize,
} from "../../../core/middlewares/auth.middleware";

// Configure multer storage for order payment proofs
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "temp/"),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || "";
    const name = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}${ext}`;
    cb(null, name);
  },
});
const upload = multer({ storage });

const router = Router();
const ordersController = new OrdersController();
const orderItemController = new OrderItemController();

// Create a new order with file upload (authenticated users only)
router.post(
  "/",
  authenticate,
  upload.single("payment_proof_file"),
  (req, res) => ordersController.createOrder(req, res)
);

// Get orders for current user (authenticated users only)
router.get("/user", authenticate, (req, res) =>
  ordersController.getOrdersByUserId(req, res)
);

// Filter orders by status (admin only)
router.get("/filter/status", authenticate, authorize("admin"), (req, res) =>
  ordersController.filterOrdersByStatus(req, res)
);

// Get all orders (admin only)
router.get("/", authenticate, authorize("admin"), (req, res) =>
  ordersController.getAllOrders(req, res)
);

// Get order by ID (authenticated users only)
router.get("/:id", authenticate, (req, res) =>
  ordersController.getOrderById(req, res)
);

// Update order by ID (admin only)
router.put("/:id", authenticate, authorize("admin"), (req, res) =>
  ordersController.updateOrder(req, res)
);

// OrderItem routes
// Get order item by ID (authenticated users only)
router.get("/items/:id", authenticate, (req, res) =>
  orderItemController.getOrderItemById(req, res)
);

// Get order items by user ID (authenticated users only)
router.get("/items/user", authenticate, (req, res) =>
  orderItemController.getOrderItemsByUserId(req, res)
);

// Create a new order item (authenticated users only)
router.post("/items", authenticate, (req, res) =>
  orderItemController.createOrderItem(req, res)
);

// Update an order item by ID (authenticated users only - owner check in controller)
router.put("/items/:id", authenticate, (req, res) =>
  orderItemController.updateOrderItem(req, res)
);

// Delete an order item by ID (authenticated users only - owner check in controller)
router.delete("/items/:id", authenticate, (req, res) =>
  orderItemController.deleteOrderItem(req, res)
);

export default router;

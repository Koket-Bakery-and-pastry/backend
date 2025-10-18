import { Router } from "express";
import {
  CustomCakeController,
  CustomOrderController,
} from "../controllers/custom-orders.controller";
import multer from "multer";

const upload = multer({ dest: "temp/" });

const router = Router();
const customCakeController = new CustomCakeController();
const customOrderController = new CustomOrderController();

// Custom Cake routes
router.post("/", upload.single("reference_image_file"), (req, res) =>
  customCakeController.createCustomCake(req, res)
);
router.get("/my-custom-orders", (req, res) =>
  customCakeController.getMyCustomCakes(req, res)
);
router.get("/:id", (req, res) =>
  customCakeController.getCustomCakeById(req, res)
);
router.put("/:id", (req, res) =>
  customCakeController.updateCustomCake(req, res)
);
router.delete("/:id", (req, res) =>
  customCakeController.deleteCustomCake(req, res)
);

// Custom Order routes
router.post("/orders", upload.single("payment_proof_file"), (req, res) =>
  customOrderController.createCustomOrder(req, res)
);
router.get("/orders/my-orders", (req, res) =>
  customOrderController.getMyCustomOrders(req, res)
);
router.get("/orders/:id", (req, res) =>
  customOrderController.getCustomOrderById(req, res)
);

// Admin routes
router.get("/customs", (req, res) =>
  customCakeController.getAllCustomCakes(req, res)
);
router.get("/orders", (req, res) =>
  customOrderController.getAllCustomOrders(req, res)
);
router.put("/orders/:id", (req, res) =>
  customOrderController.updateCustomOrder(req, res)
);
router.delete("/orders/:id", (req, res) =>
  customOrderController.deleteCustomOrder(req, res)
);
router.get("/orders/filter/status", (req, res) =>
  customOrderController.filterCustomOrdersByStatus(req, res)
);
router.get("/orders/stats/:timeframe", (req, res) =>
  customOrderController.getCustomOrderStats(req, res)
);

export default router;

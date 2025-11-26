import { Router } from "express";
import multer from "multer";
import path from "path";
import { ProductController } from "../controllers/products.controller";
import {
  authenticate,
  authorize,
} from "../../../core/middlewares/auth.middleware";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "uploads/products"),
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
const productController = new ProductController();

const maybeLogContentType = (req: any, res: any, next: any) => {
  try {
    if (process.env.UPLOAD_DEBUG) {
      console.log(
        "[upload-debug] Content-Type:",
        req.headers && req.headers["content-type"]
      );
    }
  } catch (e) {}
  next();
};

const validateMultipart = (req: any, res: any, next: any) => {
  const ct = (req.headers && req.headers["content-type"]) || "";
  // Only validate if it claims to be multipart
  if (typeof ct === "string" && ct.includes("multipart/form-data")) {
    if (!ct.includes("boundary=")) {
      return res.status(400).json({
        message:
          "Invalid Content-Type for file upload. Use multipart/form-data and do NOT set the Content-Type header manually. If using axios, let it set headers from FormData (or use formData.getHeaders()).",
      });
    }
  }
  next();
};

const safeUploadFields = (fields: any) => {
  const mw = upload.fields(fields);
  return (req: any, res: any, next: any) => {
    try {
      mw(req, res, (err: any) => {
        if (err) {
          console.error("[upload-error]", err && err.stack ? err.stack : err);
          const msg = (err && err.message) || String(err);
          if (/Malformed part header/i.test(msg) || /part header/i.test(msg)) {
            return res.status(400).json({
              message:
                "Malformed multipart/form-data request. Ensure the Content-Type header includes the boundary and the request body is valid multipart. Do not set Content-Type manually when using FormData.",
            });
          }
          return next(err);
        }
        try {
          if (process.env.UPLOAD_DEBUG) {
            console.log(
              "[upload-debug] multer saved files:",
              Object.keys((req.files as any) || {}).reduce((acc: any, k) => {
                acc[k] = (req.files as any)[k].map(
                  (f: any) => f.path || f.filename || f.originalname
                );
                return acc;
              }, {})
            );
          }
        } catch (e) {}
        next();
      });
    } catch (e: any) {
      console.error("[upload-throw]", e && e.stack ? e.stack : e);
      const msg = (e && e.message) || String(e);
      if (/Malformed part header/i.test(msg) || /part header/i.test(msg)) {
        return res.status(400).json({
          message:
            "Malformed multipart/form-data request. Ensure the Content-Type header includes the boundary and the request body is valid multipart. Do not set Content-Type manually when using FormData.",
        });
      }
      next(e);
    }
  };
};

router.post(
  "/",
  authenticate,
  authorize("admin"),
  maybeLogContentType,
  (req: any, res: any, next: any) => {
    const ct = (req.headers && req.headers["content-type"]) || "";
    // Only use multipart validation and multer if content-type is multipart
    if (typeof ct === "string" && ct.includes("multipart/form-data")) {
      return validateMultipart(req, res, () => {
        return safeUploadFields([
          { name: "image", maxCount: 1 },
          { name: "images", maxCount: 10 },
        ])(req, res, next);
      });
    }
    // For JSON requests, skip multipart handling
    next();
  },
  productController.createProduct
);

// Public routes
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);

// For updates we accept either JSON body or multipart/form-data (file + fields).
// If the request is multipart, run our validation + multer stack; otherwise skip it.
const optionalMultipartForUpdate = (req: any, res: any, next: any) => {
  const ct = (req.headers && req.headers["content-type"]) || "";
  if (typeof ct === "string" && ct.includes("multipart/form-data")) {
    // run the same validation and multer used for create
    return maybeLogContentType(req, res, () => {
      validateMultipart(req, res, () => {
        return safeUploadFields([
          { name: "image", maxCount: 1 },
          { name: "images", maxCount: 10 },
        ])(req, res, next);
      });
    });
  }
  return next();
};

// Admin only routes for update and delete
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  optionalMultipartForUpdate,
  productController.updateProduct
);
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  productController.deleteProduct
);

export default router;

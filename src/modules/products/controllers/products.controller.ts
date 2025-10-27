import { ProductService } from "../services/products.service";
import {
  createProductSchema,
  updateProductSchema,
} from "../validators/products.validator";
import { z } from "zod";
import { objectIdSchema } from "../../../core/validators/objectId.validation";
import { HttpError } from "../../../core/errors/HttpError";
import { Request, Response, NextFunction } from "express";
import { SubcategoryRepository } from "../../catalog/repositories/subcategory.repository";

export class ProductController {
  private productService: ProductService;
  private subcategoryRepository: SubcategoryRepository;

  constructor() {
    this.productService = new ProductService();
    this.subcategoryRepository = new SubcategoryRepository();
  }

  // Enrich a product object with pricing info from its subcategory for backward compatibility
  private async enrichProductWithPricing(productObj: any) {
    try {
      const subcatId = productObj.subcategory_id;
      if (!subcatId) return productObj;
      const subcat = await this.subcategoryRepository.findById(
        subcatId.toString ? subcatId.toString() : String(subcatId)
      );
      if (!subcat) return productObj;
      const kiloMap = subcat.kilo_to_price_map || {};
      productObj.kilo_to_price_map = kiloMap;
      productObj.upfront_payment = subcat.upfront_payment;
      productObj.is_pieceable = !kiloMap || Object.keys(kiloMap).length === 0;
      return productObj;
    } catch (e) {
      // don't block response if enrichment fails
      return productObj;
    }
  }

  createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bodyWithImage = { ...req.body } as any;
      const r: any = req;
      let uploadedFile: Express.Multer.File | undefined;
      if (r.file) uploadedFile = r.file;
      else if (r.files) {
        if (Array.isArray(r.files.image) && r.files.image.length)
          uploadedFile = r.files.image[0];
        else if (Array.isArray(r.files.images) && r.files.images.length)
          uploadedFile = r.files.images[0];
      }

      if (uploadedFile) {
        bodyWithImage.image_url = `/${uploadedFile.path.replace(/\\/g, "/")}`;
      }

      const mapField = (from: string, to: string) => {
        if (
          bodyWithImage[to] === undefined &&
          bodyWithImage[from] !== undefined
        ) {
          bodyWithImage[to] = bodyWithImage[from];
        }
        const rb: any = req.body as any;
        if (rb && rb[to] === undefined && rb[from] !== undefined)
          rb[to] = rb[from];
      };

      mapField("categoryId", "category_id");
      mapField("subcategoryId", "subcategory_id");

      const productData = createProductSchema.parse(bodyWithImage);
      const newProduct = await this.productService.createProduct(productData);
      const productObj = newProduct.toObject
        ? newProduct.toObject()
        : newProduct;

      const enriched = await this.enrichProductWithPricing(productObj);
      res.status(201).json({
        message: "Product created successfully",
        product: enriched,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError || error?.name === "ZodError") {
        if (req.body) {
          const rb: any = req.body as any;
          const hasSubcat =
            rb.subcategory_id !== undefined || rb.subcategoryId !== undefined;
          const hasCat =
            rb.category_id !== undefined || rb.categoryId !== undefined;
          if (!hasSubcat) {
            return next(new HttpError(400, "Subcategory ID is required."));
          }
          if (!hasCat) {
            return next(new HttpError(400, "Category ID is required."));
          }
        }

        const errs = (error.errors ?? error.issues ?? []) as any[];
        const message = errs.length
          ? errs.map((e) => e.message || e.toString()).join(", ")
          : error.message || "Invalid input";
        return next(new HttpError(400, message));
      }
      next(error);
    }
  };

  getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const querySchema = z
        .object({
          categoryId: objectIdSchema.optional(),
          subcategoryId: objectIdSchema.optional(),
        })
        .optional();
      const filters = querySchema.parse(req.query);

      const products = await this.productService.getAllProducts(filters);
      const normalized = await Promise.all(
        products.map(async (p: any) => {
          const o = p.toObject ? p.toObject() : p;
          return await this.enrichProductWithPricing(o);
        })
      );

      res.status(200).json({
        message: "Products retrieved successfully",
        products: normalized,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError || error?.name === "ZodError") {
        const errs = (error.errors ?? error.issues ?? []) as any[];
        const message = errs.length
          ? `Invalid query parameter: ${errs[0].message || errs[0].toString()}`
          : error.message || "Invalid query parameter";
        return next(new HttpError(400, message));
      }
      next(error);
    }
  };

  getProductById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = objectIdSchema.parse(req.params.id);
      const product = await this.productService.getProductById(id);
      const productObj = product.toObject ? product.toObject() : product;
      const enriched = await this.enrichProductWithPricing(productObj);
      res.status(200).json({
        message: "Product retrieved successfully",
        product: enriched,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError || error?.name === "ZodError") {
        const errs = (error.errors ?? error.issues ?? []) as any[];
        const message = errs.length
          ? `Invalid Product ID: ${errs[0].message || errs[0].toString()}`
          : error.message || "Invalid Product ID";
        return next(new HttpError(400, message));
      }
      next(error);
    }
  };

  updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = objectIdSchema.parse(req.params.id);
      const bodyWithImage = { ...req.body } as any;
      const r2: any = req;
      let uploadedFile2: Express.Multer.File | undefined;
      if (r2.file) uploadedFile2 = r2.file;
      else if (r2.files) {
        if (Array.isArray(r2.files.image) && r2.files.image.length)
          uploadedFile2 = r2.files.image[0];
        else if (Array.isArray(r2.files.images) && r2.files.images.length)
          uploadedFile2 = r2.files.images[0];
      }

      if (uploadedFile2) {
        bodyWithImage.image_url = `/${uploadedFile2.path.replace(/\\/g, "/")}`;
      }

      const mapField2 = (from: string, to: string) => {
        if (
          bodyWithImage[to] === undefined &&
          bodyWithImage[from] !== undefined
        ) {
          bodyWithImage[to] = bodyWithImage[from];
        }
        const rb2: any = req.body as any;
        if (rb2 && rb2[to] === undefined && rb2[from] !== undefined)
          rb2[to] = rb2[from];
      };

      mapField2("categoryId", "category_id");
      mapField2("subcategoryId", "subcategory_id");

      const updateData = updateProductSchema.parse(bodyWithImage);

      const updatedProduct = await this.productService.updateProduct(
        id,
        updateData
      );
      const productObj = updatedProduct.toObject
        ? updatedProduct.toObject()
        : updatedProduct;
      const enriched = await this.enrichProductWithPricing(productObj);
      res.status(200).json({
        message: "Product updated successfully",
        product: enriched,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError || error?.name === "ZodError") {
        const errs = (error.errors ?? error.issues ?? []) as any[];
        const message = errs.length
          ? errs.map((e) => e.message || e.toString()).join(", ")
          : error.message || "Invalid input";
        return next(new HttpError(400, message));
      }
      next(error);
    }
  };

  deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = objectIdSchema.parse(req.params.id);
      const deletedProduct = await this.productService.deleteProduct(id);
      const productObj = deletedProduct.toObject
        ? deletedProduct.toObject()
        : deletedProduct;
      const enriched = await this.enrichProductWithPricing(productObj);
      res.status(200).json({
        message: "Product deleted successfully",
        product: enriched,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError || error?.name === "ZodError") {
        const errs = (error.errors ?? error.issues ?? []) as any[];
        const message = errs.length
          ? `Invalid Product Id: ${errs[0].message || errs[0].toString()}`
          : error.message || "Invalid Product Id";
        return next(new HttpError(400, message));
      }
      next(error);
    }
  };
}

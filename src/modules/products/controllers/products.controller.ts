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

  // Extract uploaded file from request
  private extractUploadedFile(req: Request): Express.Multer.File | undefined {
    const r: any = req;
    if (r.file) return r.file;
    if (r.files) {
      if (Array.isArray(r.files.image) && r.files.image.length)
        return r.files.image[0];
      if (Array.isArray(r.files.images) && r.files.images.length)
        return r.files.images[0];
    }
    return undefined;
  }

  // Extract all uploaded images from request
  private extractUploadedImages(req: Request): Express.Multer.File[] {
    const r: any = req;
    const images: Express.Multer.File[] = [];

    if (r.files) {
      if (Array.isArray(r.files.images)) {
        images.push(...r.files.images);
      }
      if (Array.isArray(r.files.image)) {
        images.push(...r.files.image);
      }
    }

    return images;
  }

  // Map alternative field names to standard names
  private mapFieldNames(body: any): void {
    const mapField = (from: string, to: string) => {
      if (body[to] === undefined && body[from] !== undefined) {
        body[to] = body[from];
      }
    };
    mapField("categoryId", "category_id");
    mapField("subcategoryId", "subcategory_id");
  }

  // Enrich a product object with pricing info from its subcategory for backward compatibility
  private async enrichProductWithPricing(productObj: any) {
    try {
      const subcatId = productObj.subcategory_id;
      if (!subcatId) return productObj;

      // Check if subcategory_id is already populated (object) or just an ID
      let subcat;
      if (typeof subcatId === "object" && subcatId._id) {
        // Already populated - convert to plain object if it's a Mongoose document
        subcat = subcatId.toObject ? subcatId.toObject() : subcatId;
      } else {
        // Need to fetch
        const fetchedSubcat = await this.subcategoryRepository.findById(
          subcatId.toString ? subcatId.toString() : String(subcatId)
        );
        subcat = fetchedSubcat?.toObject
          ? fetchedSubcat.toObject()
          : fetchedSubcat;
      }

      if (!subcat) return productObj;
      const kiloMap = subcat.kilo_to_price_map || {};
      productObj.kilo_to_price_map = kiloMap;
      productObj.upfront_payment = subcat.upfront_payment;
      // Use subcategory's is_pieceable field directly
      productObj.is_pieceable = subcat.is_pieceable ?? false;

      // Enrich related products if present
      if (
        productObj.related_products &&
        Array.isArray(productObj.related_products)
      ) {
        productObj.related_products = await Promise.all(
          productObj.related_products.map(async (relatedProduct: any) => {
            const relatedObj = relatedProduct.toObject
              ? relatedProduct.toObject()
              : relatedProduct;
            return await this.enrichProductWithPricing(relatedObj);
          })
        );
      }

      return productObj;
    } catch (e) {
      // don't block response if enrichment fails
      return productObj;
    }
  }

  createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bodyWithImage = { ...req.body } as any;

      const uploadedFile = this.extractUploadedFile(req);
      if (uploadedFile) {
        bodyWithImage.image_url = `/${uploadedFile.path.replace(/\\/g, "/")}`;
      }

      // Handle multiple images
      const uploadedImages = this.extractUploadedImages(req);
      if (uploadedImages.length > 0) {
        bodyWithImage.images = uploadedImages.map(
          (file) => `/${file.path.replace(/\\/g, "/")}`
        );
      }

      this.mapFieldNames(bodyWithImage);

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

      const uploadedFile = this.extractUploadedFile(req);
      if (uploadedFile) {
        bodyWithImage.image_url = `/${uploadedFile.path.replace(/\\/g, "/")}`;
      }

      // Handle multiple images
      const uploadedImages = this.extractUploadedImages(req);
      if (uploadedImages.length > 0) {
        bodyWithImage.images = uploadedImages.map(
          (file) => `/${file.path.replace(/\\/g, "/")}`
        );
      }

      this.mapFieldNames(bodyWithImage);

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

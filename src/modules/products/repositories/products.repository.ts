import { Types } from "mongoose";
import Product, {
  IProduct,
} from "../../../../src/database/models/product.model";
import { CreateProductDto, UpdateProductDto } from "../dtos/products.dto";
import { query } from "winston";

// Products repository placeholder.
export class ProductRepository {
  async create(data: CreateProductDto): Promise<IProduct> {
    const payload: any = { ...data };

    // Normalize pricing fields: if pieceable, ensure kilo_to_price_map is an empty object
    if (payload.is_pieceable) {
      payload.kilo_to_price_map = {};
    }

    const product = new Product(payload);
    await product.save();
    return product;
  }

  async findAll(filters?: {
    categoryId?: string;
    subcategoryId?: string;
  }): Promise<IProduct[]> {
    const query: {
      category_id?: Types.ObjectId;
      subcategory_id?: Types.ObjectId;
    } = {};
    if (filters?.categoryId) {
      query.category_id = new Types.ObjectId(filters.categoryId);
    }
    if (filters?.subcategoryId) {
      query.subcategory_id = new Types.ObjectId(filters.subcategoryId);
    }
    return Product.find(query);
  }

  async findById(id: string): Promise<IProduct | null> {
    return Product.findById(id);
  }
  async findByNameAndCategoryAndSubcategory(
    name: string,
    categoryId: string,
    subcategoryId: string
  ): Promise<IProduct | null> {
    return Product.findOne({
      name,
      category_id: new Types.ObjectId(categoryId),
      subcategory_id: new Types.ObjectId(subcategoryId),
    });
  }

  async update(id: string, data: UpdateProductDto): Promise<IProduct | null> {
    const updatePayload: any = { ...data };

    if (data.category_id) {
      updatePayload.category_id = new Types.ObjectId(data.category_id);
    }
    if (data.subcategory_id) {
      updatePayload.subcategory_id = new Types.ObjectId(data.subcategory_id);
    }

    // If switching to pieceable, ensure kilo_to_price_map is cleared to an empty object
    if (updatePayload.is_pieceable === true) {
      updatePayload.kilo_to_price_map = {};
    }

    // If switching to kilo-based (is_pieceable === false), remove pieces by setting to null
    if (updatePayload.is_pieceable === false) {
      updatePayload.pieces = null;
    }

    return Product.findByIdAndUpdate(id, updatePayload, { new: true });
  }

  async delete(id: string): Promise<IProduct | null> {
    return Product.findByIdAndDelete(id);
  }
}

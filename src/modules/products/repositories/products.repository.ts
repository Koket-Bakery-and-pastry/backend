import { Types } from "mongoose";
import Product, { IProduct } from "../../../database/models/product.model";
import { CreateProductDto, UpdateProductDto } from "../dtos/products.dto";

export class ProductRepository {
  async create(data: CreateProductDto): Promise<IProduct> {
    const payload: any = { ...data };
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

    return Product.findByIdAndUpdate(id, updatePayload, { new: true });
  }

  async delete(id: string): Promise<IProduct | null> {
    return Product.findByIdAndDelete(id);
  }
}

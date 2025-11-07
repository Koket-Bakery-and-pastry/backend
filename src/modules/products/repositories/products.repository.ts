import { Types } from "mongoose";
import Product, { IProduct } from "../../../database/models/product.model";
import { CreateProductDto, UpdateProductDto } from "../dtos/products.dto";

export class ProductRepository {
  async create(data: CreateProductDto): Promise<IProduct> {
    const payload: any = { ...data };
    const product = new Product(payload);
    await product.save();
    await product.populate("category_id");
    await product.populate("subcategory_id");
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
    return Product.find(query)
      .populate("category_id")
      .populate("subcategory_id");
  }

  async findById(id: string): Promise<IProduct | null> {
    return Product.findById(id)
      .populate("category_id")
      .populate("subcategory_id");
  }

  async findRelatedProducts(
    productId: string,
    categoryId: string,
    subcategoryId: string,
    limit: number = 6
  ): Promise<IProduct[]> {
    return Product.find({
      _id: { $ne: new Types.ObjectId(productId) },
      $or: [
        { subcategory_id: new Types.ObjectId(subcategoryId) },
        { category_id: new Types.ObjectId(categoryId) },
      ],
    })
      .populate("category_id")
      .populate("subcategory_id")
      .limit(limit)
      .exec();
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

    return Product.findByIdAndUpdate(id, updatePayload, { new: true })
      .populate("category_id")
      .populate("subcategory_id");
  }

  async delete(id: string): Promise<IProduct | null> {
    const product = await Product.findByIdAndDelete(id);
    if (product) {
      await product.populate("category_id");
      await product.populate("subcategory_id");
    }
    return product;
  }
}

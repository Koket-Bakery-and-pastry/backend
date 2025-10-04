import { Types } from "mongoose";
import Subcategory, {
  ISubcategory,
} from "../../../database/models/subcategory.model";
import {
  CreateSubcategoryDto,
  UpdateSubcategoryDto,
} from "../dtos/subcategory.dto";

export class SubcategoryRepository {
  async create(data: CreateSubcategoryDto): Promise<ISubcategory> {
    const subcategory = new Subcategory(data);
    await subcategory.save();
    return subcategory;
  }

  async findAll(categoryId?: string): Promise<ISubcategory[]> {
    const query: { category_id?: any; status?: string } = {};
    if (categoryId) {
      query.category_id = new Types.ObjectId(categoryId);
    }
    return Subcategory.find(query).exec();
  }

  async findById(id: string): Promise<ISubcategory | null> {
    return Subcategory.findById(id).exec();
  }

  async findByNameAndCategory(
    name: string,
    categoryId: string
  ): Promise<ISubcategory | null> {
    return Subcategory.findOne({ name, category_id: categoryId }).exec();
  }

  async update(
    id: string,
    data: UpdateSubcategoryDto
  ): Promise<ISubcategory | null> {
    const updatePayload: any = { ...data };
    if (data.category_id) {
      updatePayload.category_id = new Types.ObjectId(data.category_id);
    }
    return Subcategory.findByIdAndUpdate(id, updatePayload, {
      new: true,
    }).exec();
  }

  async delete(id: string): Promise<ISubcategory | null> {
    return Subcategory.findByIdAndDelete(id).exec();
  }
}

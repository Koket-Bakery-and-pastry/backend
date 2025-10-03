import { Request, Response } from "express";
import mongoose from "mongoose";
import Category from "../../../database/models/category.model";

// Helper to check for valid MongoDB ObjectId
const isValidObjectId = (id: string) => mongoose.Types.ObjectId.isValid(id);

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Category name cannot be empty" });
    }
    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(409).json({
        message: `Category with name '${name}' already exists.`,
      });
    }
    const category = await Category.create({ name, description });
    return res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await Category.find();
    return res.status(200).json({
      message: "Categories retrieved successfully",
      categories,
    });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid MongoDB ObjectId format" });
  }
  const category = await Category.findById(id);
  if (!category) {
    return res
      .status(404)
      .json({ message: `Category with ID '${id}' not found.` });
  }
  return res.status(200).json({
    message: "Category retrieved successfully",
    category,
  });
};

export const updateCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description } = req.body;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid MongoDB ObjectId format" });
  }
  const category = await Category.findById(id);
  if (!category) {
    return res
      .status(404)
      .json({ message: `Category with ID '${id}' not found for update.` });
  }
  if (name) {
    const duplicate = await Category.findOne({ name, _id: { $ne: id } });
    if (duplicate) {
      return res.status(409).json({
        message: `Category with name '${name}' already exists.`,
      });
    }
    category.name = name;
  }
  if (description !== undefined) category.description = description;
  await category.save();
  return res.status(200).json({
    message: "Category updated successfully",
    category,
  });
};

export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid MongoDB ObjectId format" });
  }
  const category = await Category.findById(id);
  if (!category) {
    return res.status(404).json({
      message: `Category with ID '${id}' not found for deletion.`,
    });
  }
  await category.deleteOne();
  return res.status(200).json({
    message: "Category deleted successfully",
    category,
  });
};

import request from "supertest";
import app from "../../src/app";
import Category from "../../src/database/models/category.model";
import Subcategory from "../../src/database/models/subcategory.model";
import { ICategory } from "../../src/database/models/category.model";
import { ISubcategory } from "../../src/database/models/subcategory.model";

describe("Subcategory API", () => {
  let parentCategory: ICategory;

  // Before each test, create a parent category for subcategory operations
  beforeEach(async () => {
    parentCategory = await Category.create({
      name: "Baked Goods",
      description: "Various baked items",
    });
  });

  // Test POST /api/v1/subcategories
  it("should create a new subcategory", async () => {
    const res = await request(app).post("/api/v1/subcategories").send({
      category_id: parentCategory._id.toString(),
      name: "Chocolate Cakes",
      status: "available",
    });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Subcategory created successfully");
    expect(res.body.subcategory).toHaveProperty("_id");
    expect(res.body.subcategory.name).toBe("Chocolate Cakes");
    expect(res.body.subcategory.category_id).toBe(
      parentCategory._id.toString()
    );
  });

  it("should return 400 if required fields are missing during creation", async () => {
    const res = await request(app).post("/api/v1/subcategories").send({
      category_id: parentCategory._id.toString(),
      // name is missing
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Subcategory name cannot be empty");
  });

  it("should return 404 if parent category does not exist during creation", async () => {
    const nonExistentCategoryId = "60a7e1f4b0d8a5001f8e1a1d";
    const res = await request(app).post("/api/v1/subcategories").send({
      category_id: nonExistentCategoryId,
      name: "Non Existent Parent Sub",
    });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe(
      `Parent Category with ID '${nonExistentCategoryId}' not found.`
    );
  });

  it("should return 409 if a subcategory with the same name already exists in the same category", async () => {
    await Subcategory.create({
      category_id: parentCategory._id,
      name: "Red Velvet",
      status: "available",
    });

    const res = await request(app).post("/api/v1/subcategories").send({
      category_id: parentCategory._id.toString(),
      name: "Red Velvet",
    });

    expect(res.status).toBe(409);
    expect(res.body.message).toContain(
      "Subcategory with name 'Red Velvet' already exists in this category."
    );
  });

  // Test GET /api/v1/subcategories
  it("should retrieve all subcategories", async () => {
    await Subcategory.create({
      category_id: parentCategory._id,
      name: "Vanilla Cakes",
    });
    await Subcategory.create({
      category_id: parentCategory._id,
      name: "Fruit Tarts",
    });

    const res = await request(app).get("/api/v1/subcategories");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Subcategories retrieved successfully");
    expect(res.body.subcategories).toHaveLength(2);
    expect(res.body.subcategories[0].name).toBe("Vanilla Cakes");
  });

  it("should retrieve subcategories filtered by categoryId", async () => {
    const anotherCategory = await Category.create({ name: "Beverages" });
    await Subcategory.create({
      category_id: parentCategory._id,
      name: "Cheesecakes",
    });
    await Subcategory.create({
      category_id: anotherCategory._id,
      name: "Hot Coffee",
    });

    const res = await request(app).get(
      `/api/v1/subcategories?categoryId=${parentCategory._id.toString()}`
    );

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Subcategories retrieved successfully");
    expect(res.body.subcategories).toHaveLength(1);
    expect(res.body.subcategories[0].name).toBe("Cheesecakes");
  });

  it("should return 404 if filtering by a non-existent categoryId", async () => {
    const nonExistentCategoryId = "60a7e1f4b0d8a5001f8e1a1e";
    const res = await request(app).get(
      `/api/v1/subcategories?categoryId=${nonExistentCategoryId}`
    );

    expect(res.status).toBe(404);
    expect(res.body.message).toBe(
      `Parent Category with ID '${nonExistentCategoryId}' not found.`
    );
  });

  // Test GET /api/v1/subcategories/:id
  it("should retrieve a subcategory by ID", async () => {
    const newSubcategory: ISubcategory = await Subcategory.create({
      category_id: parentCategory._id,
      name: "Cupcakes",
      status: "available",
    });

    const res = await request(app).get(
      `/api/v1/subcategories/${newSubcategory._id.toString()}`
    );

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Subcategory retrieved successfully");
    expect(res.body.subcategory.name).toBe("Cupcakes");
  });

  it("should return 404 if subcategory ID is not found", async () => {
    const nonExistentId = "60a7e1f4b0d8a5001f8e1a1f";
    const res = await request(app).get(
      `/api/v1/subcategories/${nonExistentId}`
    );

    expect(res.status).toBe(404);
    expect(res.body.message).toBe(
      `Subcategory with ID '${nonExistentId}' not found.`
    );
  });

  it("should return 400 for an invalid subcategory ID format", async () => {
    const invalidId = "invalid-sub-id";
    const res = await request(app).get(`/api/v1/subcategories/${invalidId}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Invalid MongoDB ObjectId format");
  });

  // Test PUT /api/v1/subcategories/:id
  it("should update a subcategory by ID", async () => {
    const newSubcategory: ISubcategory = await Subcategory.create({
      category_id: parentCategory._id,
      name: "Pastries",
      status: "coming_soon",
    });

    const res = await request(app)
      .put(`/api/v1/subcategories/${newSubcategory._id.toString()}`)
      .send({ name: "Fresh Pastries", status: "available" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Subcategory updated successfully");
    expect(res.body.subcategory.name).toBe("Fresh Pastries");
    expect(res.body.subcategory.status).toBe("available");
  });

  it("should return 404 if subcategory to update is not found", async () => {
    const nonExistentId = "60a7e1f4b0d8a5001f8e1a20";
    const res = await request(app)
      .put(`/api/v1/subcategories/${nonExistentId}`)
      .send({ name: "Non Existent Sub" });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe(
      `Subcategory with ID '${nonExistentId}' not found for update.`
    );
  });

  it("should return 409 if updating to a name that already exists in the same category", async () => {
    await Subcategory.create({
      category_id: parentCategory._id,
      name: "First Sub",
      status: "available",
    });
    const secondSubcategory: ISubcategory = await Subcategory.create({
      category_id: parentCategory._id,
      name: "Second Sub",
      status: "available",
    });

    const res = await request(app)
      .put(`/api/v1/subcategories/${secondSubcategory._id.toString()}`)
      .send({ name: "First Sub" });

    expect(res.status).toBe(409);
    expect(res.body.message).toContain(
      "Subcategory with name 'First Sub' already exists in the target category."
    );
  });

  it("should allow moving a subcategory to a different parent category", async () => {
    const initialCategory = await Category.create({
      name: "Desserts",
      description: "Sweet treats",
    });
    const targetCategory = await Category.create({
      name: "Breakfast Items",
      description: "Morning delights",
    });

    const subcategoryToMove = await Subcategory.create({
      category_id: initialCategory._id,
      name: "Pancakes",
      status: "available",
    });

    const res = await request(app)
      .put(`/api/v1/subcategories/${subcategoryToMove._id.toString()}`)
      .send({ category_id: targetCategory._id.toString() });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Subcategory updated successfully");
    expect(res.body.subcategory.category_id).toBe(
      targetCategory._id.toString()
    );

    // Verify it's no longer under initialCategory
    const oldParentSubcategories = await Subcategory.find({
      category_id: initialCategory._id,
    });
    expect(oldParentSubcategories).toHaveLength(0);
    // Verify it's under targetCategory
    const newParentSubcategories = await Subcategory.find({
      category_id: targetCategory._id,
    });
    expect(newParentSubcategories).toHaveLength(1);
    expect(newParentSubcategories[0].name).toBe("Pancakes");
  });

  // Test DELETE /api/v1/subcategories/:id
  it("should delete a subcategory by ID", async () => {
    const newSubcategory: ISubcategory = await Subcategory.create({
      category_id: parentCategory._id,
      name: "Cookies",
      status: "available",
    });

    const res = await request(app).delete(
      `/api/v1/subcategories/${newSubcategory._id.toString()}`
    );

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Subcategory deleted successfully");
    expect(res.body.subcategory.name).toBe("Cookies");

    // Verify it's actually deleted
    const foundSubcategory = await Subcategory.findById(newSubcategory._id);
    expect(foundSubcategory).toBeNull();
  });

  it("should return 404 if subcategory to delete is not found", async () => {
    const nonExistentId = "60a7e1f4b0d8a5001f8e1a21";
    const res = await request(app).delete(
      `/api/v1/subcategories/${nonExistentId}`
    );

    expect(res.status).toBe(404);
    expect(res.body.message).toBe(
      `Subcategory with ID '${nonExistentId}' not found for deletion.`
    );
  });
});

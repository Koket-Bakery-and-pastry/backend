import app from "../../src/app";
import Category, { ICategory } from "../../src/database/models/category.model";
import request from "supertest";

describe("Category API", () => {
  // Test POST /api/v1/categories
  it("should create a new category", async () => {
    const res = await request(app).post("/api/v1/categories").send({
      name: "Classic Cakes",
      description: "Traditional and timeless cake flavors.",
    });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Category created successfully");
    expect(res.body.category).toHaveProperty("_id");
    expect(res.body.category.name).toBe("Classic Cakes");
  });

  it("should return 400 if required fields are missing during creation", async () => {
    const res = await request(app).post("/api/v1/categories").send({
      description: "Missing name",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Category name cannot be empty");
  });

  it("should return 409 if a category with the same name already exists", async () => {
    // Create first category
    await request(app)
      .post("/api/v1/categories")
      .send({ name: "Specialty Desserts", description: "Unique treats" });

    // Try to create another with the same name
    const res = await request(app).post("/api/v1/categories").send({
      name: "Specialty Desserts",
      description: "Another unique treats",
    });

    expect(res.status).toBe(409);
    expect(res.body.message).toContain(
      "Category with name 'Specialty Desserts' already exists."
    );
  });

  // Test GET /api/v1/categories
  it("should retrieve all categories", async () => {
    // Add some categories first
    await Category.create({
      name: "Cupcakes",
      description: "Miniature delights",
    });
    await Category.create({
      name: "Pies",
      description: "Fruit and cream pies",
    });

    const res = await request(app).get("/api/v1/categories");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Categories retrieved successfully");
    expect(res.body.categories).toHaveLength(2);
    expect(res.body.categories[0].name).toBe("Cupcakes");
    expect(res.body.categories[1].name).toBe("Pies");
  });

  // Test GET /api/v1/categories/:id
  it("should retrieve a category by ID", async () => {
    const newCategory = await Category.create({
      name: "Muffins",
      description: "Breakfast goods",
    });

    const res = await request(app).get(
      `/api/v1/categories/${(newCategory._id as any).toString()}`
    );

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Category retrieved successfully");
    expect(res.body.category.name).toBe("Muffins");
  });

  it("should return 404 if category ID is not found", async () => {
    const nonExistentId = "60a7e1f4b0d8a5001f8e1a1a"; // A valid-looking but non-existent ID
    const res = await request(app).get(`/api/v1/categories/${nonExistentId}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe(
      `Category with ID '${nonExistentId}' not found.`
    );
  });

  it("should return 400 for an invalid category ID format", async () => {
    const invalidId = "invalid-mongo-id";
    const res = await request(app).get(`/api/v1/categories/${invalidId}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Invalid MongoDB ObjectId format");
  });

  // Test PUT /api/v1/categories/:id
  it("should update a category by ID", async () => {
    const newCategory: ICategory = await Category.create({
      name: "Breads",
      description: "Artisan breads",
    });

    const res = await request(app)
      .put(`/api/v1/categories/${(newCategory._id as any).toString()}`)
      .send({ name: "Artisan Breads", description: "Hand-crafted loaves" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Category updated successfully");
    expect(res.body.category.name).toBe("Artisan Breads");
    expect(res.body.category.description).toBe("Hand-crafted loaves");
  });

  it("should return 404 if category to update is not found", async () => {
    const nonExistentId = "60a7e1f4b0d8a5001f8e1a1b";
    const res = await request(app)
      .put(`/api/v1/categories/${nonExistentId}`)
      .send({ name: "Non Existent" });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe(
      `Category with ID '${nonExistentId}' not found for update.`
    );
  });

  it("should return 409 if updating to a name that already exists", async () => {
    await Category.create({
      name: "First Category",
      description: "Description 1",
    });
    const secondCategory: ICategory = await Category.create({
      name: "Second Category",
      description: "Description 2",
    });

    const res = await request(app)
      .put(`/api/v1/categories/${(secondCategory._id as any).toString()}`)
      .send({ name: "First Category" }); // Try to update to existing name

    expect(res.status).toBe(409);
    expect(res.body.message).toContain(
      "Category with name 'First Category' already exists."
    );
  });

  // Test DELETE /api/v1/categories/:id
  it("should delete a category by ID", async () => {
    const newCategory: ICategory = await Category.create({
      name: "Pastries",
      description: "Sweet treats",
    });

    const res = await request(app).delete(
      `/api/v1/categories/${(newCategory._id as any).toString()}`
    );

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Category deleted successfully");
    expect(res.body.category.name).toBe("Pastries");

    // Verify it's actually deleted
    const foundCategory = await Category.findById(newCategory._id);
    expect(foundCategory).toBeNull();
  });

  it("should return 404 if category to delete is not found", async () => {
    const nonExistentId = "60a7e1f4b0d8a5001f8e1a1c";
    const res = await request(app).delete(
      `/api/v1/categories/${nonExistentId}`
    );

    expect(res.status).toBe(404);
    expect(res.body.message).toBe(
      `Category with ID '${nonExistentId}' not found for deletion.`
    );
  });
});

import request from "supertest";
import app from "../../src/app";
import Category from "../../src/database/models/category.model";
import Subcategory from "../../src/database/models/subcategory.model";
import Product from "../../src/database/models/product.model";
import { ICategory } from "../../src/database/models/category.model";
import { ISubcategory } from "../../src/database/models/subcategory.model";
import { IProduct } from "../../src/database/models/product.model";
import { Types } from "mongoose";

describe("Product API", () => {
  let parentCategory: ICategory;
  let parentSubcategory: ISubcategory;
  let anotherCategory: ICategory;
  let anotherSubcategory: ISubcategory;

  beforeEach(async () => {
    parentCategory = await Category.create({
      name: "Cakes",
      description: "All kinds of cakes",
    });
    parentSubcategory = await Subcategory.create({
      category_id: parentCategory._id,
      name: "Chocolate Cakes",
    });

    anotherCategory = await Category.create({
      name: "Pastries",
      description: "Sweet and savory pastries",
    });
    anotherSubcategory = await Subcategory.create({
      category_id: anotherCategory._id,
      name: "Croissants",
    });
  });

  // --- POST /api/v1/products ---
  describe("POST /api/v1/products", () => {
    it("should create a new kilo-based product", async () => {
      const res = await request(app)
        .post("/api/v1/products")
        .send({
          name: "Dark Chocolate Cake",
          category_id: parentCategory._id.toString(),
          subcategory_id: parentSubcategory._id.toString(),
          description: "Rich and moist dark chocolate cake.",
          kilo_to_price_map: { "0.5kg": 300, "1kg": 550, "1.5kg": 800 },
          is_pieceable: false,
          upfront_payment: 100, // Fixed amount
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Product created successfully");
      expect(res.body.product).toHaveProperty("_id");
      expect(res.body.product.name).toBe("Dark Chocolate Cake");
      expect(res.body.product.is_pieceable).toBe(false);
      expect(res.body.product.kilo_to_price_map["1kg"]).toBe(550);
      expect(res.body.product.upfront_payment).toBe(100);
      expect(res.body.product.pieces).toBeUndefined(); // Should not have pieces
    });

    it("should create a new pieceable product", async () => {
      const res = await request(app).post("/api/v1/products").send({
        name: "Vanilla Cupcake",
        image_url: "http://example.com/vanilla.jpg",
        category_id: parentCategory._id.toString(),
        subcategory_id: parentSubcategory._id.toString(),
        description: "Classic vanilla cupcake with buttercream.",
        is_pieceable: true,
        pieces: 12,
        upfront_payment: 50, // Percentage
      });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Product created successfully");
      expect(res.body.product.name).toBe("Vanilla Cupcake");
      expect(res.body.product.is_pieceable).toBe(true);
      expect(res.body.product.pieces).toBe(12);
      expect(res.body.product.kilo_to_price_map).toBeInstanceOf(Object); // Should be an empty object/map
      expect(Object.keys(res.body.product.kilo_to_price_map).length).toBe(0);
    });

    it("should return 400 if required fields are missing", async () => {
      const res = await request(app)
        .post("/api/v1/products")
        .send({
          name: "Missing Info Cake",
          category_id: parentCategory._id.toString(),
          // subcategory_id is missing
          is_pieceable: false,
          kilo_to_price_map: { "1kg": 500 },
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Subcategory ID is required.");
    });

    it("should return 400 for invalid pricing configuration (not pieceable, no kilo map)", async () => {
      const res = await request(app).post("/api/v1/products").send({
        name: "Invalid Cake",
        category_id: parentCategory._id.toString(),
        subcategory_id: parentSubcategory._id.toString(),
        is_pieceable: false,
        // kilo_to_price_map is missing or empty
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Product must be either pieceable");
    });

    it("should return 400 for invalid pricing configuration (pieceable, no pieces)", async () => {
      const res = await request(app).post("/api/v1/products").send({
        name: "Invalid Cupcake",
        category_id: parentCategory._id.toString(),
        subcategory_id: parentSubcategory._id.toString(),
        is_pieceable: true,
        // pieces is missing
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Product must be either pieceable");
    });

    it("should return 404 if parent category does not exist", async () => {
      const nonExistentId = "60a7e1f4b0d8a5001f8e1a1a";
      const res = await request(app)
        .post("/api/v1/products")
        .send({
          name: "Orphan Cake",
          category_id: nonExistentId,
          subcategory_id: parentSubcategory._id.toString(),
          is_pieceable: false,
          kilo_to_price_map: { "1kg": 500 },
        });
      expect(res.status).toBe(404);
      expect(res.body.message).toContain(
        `Category with ID '${nonExistentId}' not found.`
      );
    });

    it("should return 404 if parent subcategory does not exist", async () => {
      const nonExistentId = "60a7e1f4b0d8a5001f8e1a1b";
      const res = await request(app)
        .post("/api/v1/products")
        .send({
          name: "Sub-Orphan Cake",
          category_id: parentCategory._id.toString(),
          subcategory_id: nonExistentId,
          is_pieceable: false,
          kilo_to_price_map: { "1kg": 500 },
        });
      expect(res.status).toBe(404);
      expect(res.body.message).toContain(
        `Subcategory with ID '${nonExistentId}' not found.`
      );
    });

    it("should return 400 if subcategory does not belong to category", async () => {
      const res = await request(app)
        .post("/api/v1/products")
        .send({
          name: "Mismatched Cake",
          category_id: parentCategory._id.toString(), // Cakes
          subcategory_id: anotherSubcategory._id.toString(), // Croissants (belongs to Pastries)
          is_pieceable: false,
          kilo_to_price_map: { "1kg": 500 },
        });
      expect(res.status).toBe(400);
      expect(res.body.message).toContain(
        `Subcategory with ID '${anotherSubcategory._id.toString()}' does not belong to Category with ID '${parentCategory._id.toString()}'.`
      );
    });

    it("should return 409 if a product with the same name exists in the same category/subcategory", async () => {
      await Product.create({
        name: "Strawberry Delight",
        category_id: parentCategory._id,
        subcategory_id: parentSubcategory._id,
        is_pieceable: false,
        kilo_to_price_map: { "1kg": 600 },
      });

      const res = await request(app)
        .post("/api/v1/products")
        .send({
          name: "Strawberry Delight", // Duplicate name
          category_id: parentCategory._id.toString(),
          subcategory_id: parentSubcategory._id.toString(),
          is_pieceable: false,
          kilo_to_price_map: { "0.5kg": 300 },
        });
      expect(res.status).toBe(409);
      expect(res.body.message).toContain(
        "Product with name 'Strawberry Delight' already exists in this category/subcategory."
      );
    });
  });

  // --- GET /api/v1/products ---
  describe("GET /api/v1/products", () => {
    it("should retrieve all products", async () => {
      await Product.create({
        name: "Lemon Meringue Pie",
        category_id: parentCategory._id,
        subcategory_id: parentSubcategory._id,
        is_pieceable: true,
        pieces: 8,
      });
      await Product.create({
        name: "Almond Croissant",
        category_id: anotherCategory._id,
        subcategory_id: anotherSubcategory._id,
        is_pieceable: true,
        pieces: 1,
      });

      const res = await request(app).get("/api/v1/products");
      expect(res.status).toBe(200);
      expect(res.body.products).toHaveLength(2);
      expect(res.body.products.map((p: any) => p.name)).toEqual(
        expect.arrayContaining(["Lemon Meringue Pie", "Almond Croissant"])
      );
    });

    it("should retrieve products filtered by categoryId", async () => {
      await Product.create({
        name: "Red Velvet Cake",
        category_id: parentCategory._id,
        subcategory_id: parentSubcategory._id,
        is_pieceable: false,
        kilo_to_price_map: { "1kg": 700 },
      });
      await Product.create({
        name: "Pain au Chocolat",
        category_id: anotherCategory._id,
        subcategory_id: anotherSubcategory._id,
        is_pieceable: true,
        pieces: 1,
      });

      const res = await request(app).get(
        `/api/v1/products?categoryId=${parentCategory._id.toString()}`
      );
      expect(res.status).toBe(200);
      expect(res.body.products).toHaveLength(1);
      expect(res.body.products[0].name).toBe("Red Velvet Cake");
    });

    it("should retrieve products filtered by subcategoryId", async () => {
      const cheesecakeSub = await Subcategory.create({
        category_id: parentCategory._id,
        name: "Cheesecakes",
      });
      await Product.create({
        name: "New York Cheesecake",
        category_id: parentCategory._id,
        subcategory_id: cheesecakeSub._id,
        is_pieceable: false,
        kilo_to_price_map: { "1kg": 900 },
      });
      await Product.create({
        name: "Opera Cake",
        category_id: parentCategory._id,
        subcategory_id: parentSubcategory._id,
        is_pieceable: false,
        kilo_to_price_map: { "1kg": 850 },
      });

      const res = await request(app).get(
        `/api/v1/products?subcategoryId=${cheesecakeSub._id.toString()}`
      );
      expect(res.status).toBe(200);
      expect(res.body.products).toHaveLength(1);
      expect(res.body.products[0].name).toBe("New York Cheesecake");
    });

    it("should return 404 if filtered by non-existent categoryId", async () => {
      const nonExistentId = "60a7e1f4b0d8a5001f8e1a22";
      const res = await request(app).get(
        `/api/v1/products?categoryId=${nonExistentId}`
      );
      expect(res.status).toBe(404);
      expect(res.body.message).toContain(
        `Category with ID '${nonExistentId}' not found.`
      );
    });
  });

  // --- GET /api/v1/products/:id ---
  describe("GET /api/v1/products/:id", () => {
    it("should retrieve a product by ID", async () => {
      const newProduct = (await Product.create({
        name: "Fudge Brownie",
        category_id: parentCategory._id,
        subcategory_id: parentSubcategory._id,
        is_pieceable: true,
        pieces: 1,
        upfront_payment: 10,
      })) as IProduct & { _id: Types.ObjectId };

      const res = await request(app).get(
        `/api/v1/products/${newProduct._id.toString()}`
      );
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Product retrieved successfully");
      expect(res.body.product.name).toBe("Fudge Brownie");
      expect(res.body.product.is_pieceable).toBe(true);
      expect(res.body.product.pieces).toBe(1);
    });

    it("should return 404 if product ID is not found", async () => {
      const nonExistentId = "60a7e1f4b0d8a5001f8e1a23";
      const res = await request(app).get(`/api/v1/products/${nonExistentId}`);
      expect(res.status).toBe(404);
      expect(res.body.message).toBe(
        `Product with ID '${nonExistentId}' not found.`
      );
    });

    it("should return 400 for an invalid product ID format", async () => {
      const invalidId = "invalid-product-id";
      const res = await request(app).get(`/api/v1/products/${invalidId}`);
      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Invalid MongoDB ObjectId format");
    });
  });

  // --- PUT /api/v1/products/:id ---
  describe("PUT /api/v1/products/:id", () => {
    let existingProduct: IProduct & { _id: Types.ObjectId };

    beforeEach(async () => {
      existingProduct = (await Product.create({
        name: "Original Cake",
        category_id: parentCategory._id,
        subcategory_id: parentSubcategory._id,
        is_pieceable: false,
        kilo_to_price_map: { "1kg": 500 },
        upfront_payment: 50,
      })) as IProduct & { _id: Types.ObjectId };
    });

    it("should update a product name and description", async () => {
      const res = await request(app)
        .put(`/api/v1/products/${existingProduct._id.toString()}`)
        .send({ name: "Updated Cake Name", description: "New Description" });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Product updated successfully");
      expect(res.body.product.name).toBe("Updated Cake Name");
      expect(res.body.product.description).toBe("New Description");
      expect(res.body.product.kilo_to_price_map["1kg"]).toBe(500); // Should remain same
    });

    it("should update kilo_to_price_map", async () => {
      const res = await request(app)
        .put(`/api/v1/products/${existingProduct._id.toString()}`)
        .send({ kilo_to_price_map: { "0.5kg": 280, "1kg": 520, "2kg": 1000 } });

      expect(res.status).toBe(200);
      expect(res.body.product.kilo_to_price_map["1kg"]).toBe(520);
      expect(res.body.product.kilo_to_price_map["2kg"]).toBe(1000);
    });

    it("should switch product to pieceable with pieces", async () => {
      const res = await request(app)
        .put(`/api/v1/products/${existingProduct._id.toString()}`)
        .send({ is_pieceable: true, pieces: 6 });

      expect(res.status).toBe(200);
      expect(res.body.product.is_pieceable).toBe(true);
      expect(res.body.product.pieces).toBe(6);
      expect(Object.keys(res.body.product.kilo_to_price_map).length).toBe(0); // Should be cleared or ignored in context of pieceable only
    });

    it("should switch product from pieceable to kilo-based with map", async () => {
      const pieceableProduct = (await Product.create({
        name: "Cookies",
        category_id: parentCategory._id,
        subcategory_id: parentSubcategory._id,
        is_pieceable: true,
        pieces: 12,
      })) as IProduct & { _id: Types.ObjectId };

      const res = await request(app)
        .put(
          `/api/v1/products/${(
            pieceableProduct as IProduct & { _id: Types.ObjectId }
          )._id.toString()}`
        )
        .send({
          is_pieceable: false,
          kilo_to_price_map: { "0.25kg": 150, "0.5kg": 280 },
        });

      expect(res.status).toBe(200);
      expect(res.body.product.is_pieceable).toBe(false);
      expect(res.body.product.pieces).toBeNull(); // Pieces should be removed
      expect(res.body.product.kilo_to_price_map["0.25kg"]).toBe(150);
    });

    it("should return 400 if updating to an invalid pricing configuration (is_pieceable=true, no pieces)", async () => {
      const res = await request(app)
        .put(`/api/v1/products/${existingProduct._id.toString()}`)
        .send({ is_pieceable: true }); // Missing pieces when changing to pieceable

      expect(res.status).toBe(400);
      expect(res.body.message).toContain(
        "Validation error during update: Product must be either pieceable (with pieces) or sold by kilo (with kilo_to_price_map)."
      );
    });

    it("should return 400 if updating to an invalid pricing configuration (is_pieceable=false, no kilo_to_price_map)", async () => {
      const pieceableProduct = await Product.create({
        name: "Biscuits",
        category_id: parentCategory._id,
        subcategory_id: parentSubcategory._id,
        is_pieceable: true,
        pieces: 20,
      });

      const res = await request(app)
        .put(
          `/api/v1/products/${(
            pieceableProduct as IProduct & { _id: Types.ObjectId }
          )._id.toString()}`
        )
        .send({ is_pieceable: false, kilo_to_price_map: {} }); // Empty map when changing to kilo-based

      expect(res.status).toBe(400);
      expect(res.body.message).toContain(
        "Validation error during update: Product must be either pieceable (with pieces) or sold by kilo (with kilo_to_price_map)."
      );
    });

    it("should return 404 if product to update is not found", async () => {
      const nonExistentId = "60a7e1f4b0d8a5001f8e1a24";
      const res = await request(app)
        .put(`/api/v1/products/${nonExistentId}`)
        .send({ name: "Non Existent Product" });
      expect(res.status).toBe(404);
      expect(res.body.message).toBe(
        `Product with ID '${nonExistentId}' not found for update.`
      );
    });

    it("should return 409 if updating to a name that already exists in the same category/subcategory", async () => {
      await Product.create({
        name: "Conflicting Product",
        category_id: parentCategory._id,
        subcategory_id: parentSubcategory._id,
        is_pieceable: false,
        kilo_to_price_map: { "1kg": 100 },
      });

      const res = await request(app)
        .put(`/api/v1/products/${existingProduct._id.toString()}`)
        .send({ name: "Conflicting Product" });

      expect(res.status).toBe(409);
      expect(res.body.message).toContain(
        "Product with name 'Conflicting Product' already exists in the target category/subcategory."
      );
    });

    it("should return 400 if changing to non-existent category/subcategory", async () => {
      const nonExistentId = "60a7e1f4b0d8a5001f8e1a25";
      const res = await request(app)
        .put(`/api/v1/products/${existingProduct._id.toString()}`)
        .send({ category_id: nonExistentId });

      expect(res.status).toBe(404);
      expect(res.body.message).toContain(
        `Category with ID '${nonExistentId}' not found.`
      );
    });
  });

  // --- DELETE /api/v1/products/:id ---
  describe("DELETE /api/v1/products/:id", () => {
    it("should delete a product by ID", async () => {
      const newProduct: IProduct = await Product.create({
        name: "To Be Deleted",
        category_id: parentCategory._id,
        subcategory_id: parentSubcategory._id,
        is_pieceable: true,
        pieces: 1,
      });

      const res = await request(app).delete(
        `/api/v1/products/${(
          newProduct as IProduct & { _id: Types.ObjectId }
        )._id.toString()}`
      );

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Product deleted successfully");
      expect(res.body.product.name).toBe("To Be Deleted");

      const foundProduct = await Product.findById(newProduct._id);
      expect(foundProduct).toBeNull();
    });

    it("should return 404 if product to delete is not found", async () => {
      const nonExistentId = "60a7e1f4b0d8a5001f8e1a26";
      const res = await request(app).delete(
        `/api/v1/products/${nonExistentId}`
      );
      expect(res.status).toBe(404);
      expect(res.body.message).toBe(
        `Product with ID '${nonExistentId}' not found for deletion.`
      );
    });
  });
});

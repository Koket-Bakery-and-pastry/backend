import request from "supertest";
import app from "../../src/app";
import Category from "../../src/database/models/category.model";
import Subcategory from "../../src/database/models/subcategory.model";
import Product from "../../src/database/models/product.model";
import User from "../../src/database/models/user.model"; // Assuming User model is available
import ProductReview from "../../src/database/models/productReview.model";
import { ICategory } from "../../src/database/models/category.model";
import { ISubcategory } from "../../src/database/models/subcategory.model";
import { IProduct } from "../../src/database/models/product.model";
import { IUser } from "../../src/database/models/user.model";
import { IProductReview } from "../../src/database/models/productReview.model";

describe("Product Review API", () => {
  let category: ICategory;
  let subcategory: ISubcategory;
  let product: IProduct;
  let user: IUser;
  let user2: IUser;

  // Setup parent entities before each test
  beforeEach(async () => {
    category = await Category.create({ name: "Test Category" });
    subcategory = await Subcategory.create({
      category_id: category._id,
      name: "Test Subcategory",
    });
    product = await Product.create({
      name: "Test Product",
      category_id: category._id,
      subcategory_id: subcategory._id,
      is_pieceable: false,
      kilo_to_price_map: { "1kg": 500 },
    });
    user = await User.create({
      name: "Test User",
      email: "testuser@example.com",
      password_hash: "hashedpassword1",
      role: "customer",
    });
    user2 = await User.create({
      name: "Another User",
      email: "anotheruser@example.com",
      password_hash: "hashedpassword2",
      role: "customer",
    });
  });

  // Test POST /api/v1/reviews - Create new review
  it("should create a new product review", async () => {
    const res = await request(app).post("/api/v1/reviews").send({
      product_id: product._id.toString(),
      user_id: user._id.toString(),
      rating: 5,
      comment: "Absolutely delicious!",
    });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe(
      "Product review created/updated successfully"
    );
    expect(res.body.review).toHaveProperty("_id");
    expect(res.body.review.rating).toBe(5);
    expect(res.body.review.comment).toBe("Absolutely delicious!");
    expect(res.body.review.product_id).toBe(product._id.toString());
    expect(res.body.review.user_id).toBe(user._id.toString());

    const createdReview = await ProductReview.findById(res.body.review._id);
    expect(createdReview).not.toBeNull();
  });

  it("should return 400 if required fields are missing during review creation", async () => {
    const res = await request(app).post("/api/v1/reviews").send({
      product_id: product._id.toString(),
      user_id: user._id.toString(),
      // rating is missing
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Rating must be at least 1.");
  });

  it("should return 404 if product does not exist for review", async () => {
    const nonExistentProductId = "60a7e1f4b0d8a5001f8e1a1a";
    const res = await request(app).post("/api/v1/reviews").send({
      product_id: nonExistentProductId,
      user_id: user._id.toString(),
      rating: 4,
    });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe(
      `Product with ID '${nonExistentProductId}' not found.`
    );
  });

  it("should return 404 if user does not exist for review", async () => {
    const nonExistentUserId = "60a7e1f4b0d8a5001f8e1a1b";
    const res = await request(app).post("/api/v1/reviews").send({
      product_id: product._id.toString(),
      user_id: nonExistentUserId,
      rating: 3,
    });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe(
      `User with ID '${nonExistentUserId}' not found.`
    );
  });

  // Test POST /api/v1/reviews - Update existing review
  it("should update an existing product review if user reviews same product again", async () => {
    // First review
    await request(app).post("/api/v1/reviews").send({
      product_id: product._id.toString(),
      user_id: user._id.toString(),
      rating: 3,
      comment: "It was okay.",
    });

    // Second review (should update the first one)
    const res = await request(app).post("/api/v1/reviews").send({
      product_id: product._id.toString(),
      user_id: user._id.toString(),
      rating: 4,
      comment: "Better than I thought!",
    });

    expect(res.status).toBe(201); // Still 201 as it's a "createOrUpdate" endpoint
    expect(res.body.message).toBe(
      "Product review created/updated successfully"
    );
    expect(res.body.review.rating).toBe(4);
    expect(res.body.review.comment).toBe("Better than I thought!");

    // Verify only one review exists for this product by this user
    const reviews = await ProductReview.find({
      product_id: product._id,
      user_id: user._id,
    });
    expect(reviews).toHaveLength(1);
  });

  // Test GET /api/v1/reviews
  it("should retrieve all product reviews", async () => {
    await ProductReview.create({
      product_id: product._id,
      user_id: user._id,
      rating: 5,
    });
    await ProductReview.create({
      product_id: product._id,
      user_id: user2._id,
      rating: 4,
    });

    const res = await request(app).get("/api/v1/reviews");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Product reviews fetched successfully");
    expect(res.body.reviews).toHaveLength(2);
    expect(res.body.reviews[0].rating).toBe(5);
    expect(res.body.reviews[1].rating).toBe(4);
  });

  it("should retrieve product reviews filtered by productId", async () => {
    const product2 = await Product.create({
      name: "Another Product",
      category_id: category._id,
      subcategory_id: subcategory._id,
      is_pieceable: true,
      pieces: 10,
    });
    await ProductReview.create({
      product_id: product._id,
      user_id: user._id,
      rating: 5,
    });
    await ProductReview.create({
      product_id: product2._id,
      user_id: user2._id,
      rating: 3,
    });

    const res = await request(app).get(
      `/api/v1/reviews?productId=${product._id.toString()}`
    );

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Product reviews fetched successfully");
    expect(res.body.reviews).toHaveLength(1);
    expect(res.body.reviews[0].product_id).toBe(product._id.toString());
  });

  it("should retrieve product reviews filtered by userId", async () => {
    const product2 = await Product.create({
      name: "Another Product 2",
      category_id: category._id,
      subcategory_id: subcategory._id,
      is_pieceable: true,
      pieces: 10,
    });
    await ProductReview.create({
      product_id: product._id,
      user_id: user._id,
      rating: 5,
    });
    await ProductReview.create({
      product_id: product2._id,
      user_id: user2._id,
      rating: 3,
    });

    const res = await request(app).get(
      `/api/v1/reviews?userId=${user._id.toString()}`
    );

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Product reviews fetched successfully");
    expect(res.body.reviews).toHaveLength(1);
    expect(res.body.reviews[0].user_id).toBe(user._id.toString());
  });
});

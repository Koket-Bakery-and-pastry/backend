import request from "supertest";
import app from "../../src/app";
import User from "../../src/database/models/user.model";
import Category from "../../src/database/models/category.model";
import Subcategory from "../../src/database/models/subcategory.model";
import Product from "../../src/database/models/product.model";
import Cart from "../../src/database/models/cart.model";
import { Types } from "mongoose";

describe("Carts API", () => {
  let user: any;
  let category: any;
  let subcategory: any;
  let kiloProduct: any;
  let pieceableProduct: any;

  beforeEach(async () => {
    // Create a user
    user = await User.create({
      name: "Test User",
      email: `test+${Date.now()}@example.com`,
      password_hash: "hash",
    });

    category = await Category.create({ name: "Cakes" });
    subcategory = await Subcategory.create({
      category_id: category._id,
      name: "Chocolate",
    });

    kiloProduct = await Product.create({
      name: "Kilo Cake",
      category_id: category._id,
      subcategory_id: subcategory._id,
      is_pieceable: false,
      kilo_to_price_map: { "1kg": 500, "2kg": 900 },
    });

    pieceableProduct = await Product.create({
      name: "Pieceable Cake",
      category_id: category._id,
      subcategory_id: subcategory._id,
      is_pieceable: true,
      pieces: 12,
    });
  });

  afterEach(async () => {
    // Clear carts collection explicitly
    await Cart.deleteMany({});
  });

  describe("POST /api/v1/carts", () => {
    it("should add a kilo-based product to cart", async () => {
      const res = await request(app)
        .post("/api/v1/carts")
        .set("x-test-user-id", user._id.toString())
        .send({
          product_id: kiloProduct._id.toString(),
          kilo: 1,
          quantity: 1,
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Cart item added/updated successfully");
      expect(res.body.cartItem).toHaveProperty("_id");
      expect(res.body.cartItem.product_id.toString()).toBe(
        kiloProduct._id.toString()
      );
      expect(res.body.cartItem.kilo).toBe(1);
    });

    it("should add a pieceable product to cart", async () => {
      const res = await request(app)
        .post("/api/v1/carts")
        .set("x-test-user-id", user._id.toString())
        .send({
          product_id: pieceableProduct._id.toString(),
          pieces: 2,
        });

      expect(res.status).toBe(201);
      expect(res.body.cartItem).toHaveProperty("_id");
      expect(res.body.cartItem.product_id.toString()).toBe(
        pieceableProduct._id.toString()
      );
      expect(res.body.cartItem.pieces).toBe(2);
    });

    it("should merge duplicate cart adds (update existing item)", async () => {
      // Add initial item
      const r1 = await request(app)
        .post("/api/v1/carts")
        .set("x-test-user-id", user._id.toString())
        .send({
          product_id: kiloProduct._id.toString(),
          kilo: 1,
          quantity: 1,
        });
      expect(r1.status).toBe(201);

      // Add same product again with different quantity
      const r2 = await request(app)
        .post("/api/v1/carts")
        .set("x-test-user-id", user._id.toString())
        .send({
          product_id: kiloProduct._id.toString(),
          kilo: 1,
          quantity: 2,
        });

      expect(r2.status).toBe(201);
      // Should not create a second item; should update the existing one
      const cartItems = await Cart.find({ user_id: user._id });
      expect(cartItems.length).toBe(1);
      expect(cartItems[0].quantity).toBe(2);
    });

    it("should return 400 for invalid payload", async () => {
      const res = await request(app)
        .post("/api/v1/carts")
        .set("x-test-user-id", user._id.toString())
        .send({
          // missing product_id
          kilo: 1,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Product ID is required");
    });

    it("should return 404 if product does not exist", async () => {
      const fakeId = new Types.ObjectId().toString();
      const res = await request(app)
        .post("/api/v1/carts")
        .set("x-test-user-id", user._id.toString())
        .send({
          product_id: fakeId,
          kilo: 1,
        });

      expect(res.status).toBe(404);
      expect(res.body.message).toContain("Product with ID");
    });
  });

  describe("GET /api/v1/carts", () => {
    it("should retrieve user cart items", async () => {
      // Seed cart
      await Cart.create({
        user_id: user._id,
        product_id: kiloProduct._id,
        kilo: 1,
        quantity: 1,
      });

      const res = await request(app)
        .get("/api/v1/carts")
        .set("x-test-user-id", user._id.toString());

      expect(res.status).toBe(200);
      expect(res.body.cartItems).toHaveLength(1);
      expect(res.body.cartItems[0].product_id._id.toString()).toBe(
        kiloProduct._id.toString()
      );
    });
  });

  describe("PATCH /api/v1/carts/:id", () => {
    it("should update a cart item when authorized", async () => {
      const cartItem = await Cart.create({
        user_id: user._id,
        product_id: pieceableProduct._id,
        pieces: 2,
        quantity: 2,
        kilo: 0,
      });

      const res = await request(app)
        .patch(`/api/v1/carts/${cartItem._id.toString()}`)
        .set("x-test-user-id", user._id.toString())
        .send({ pieces: 4 });

      expect(res.status).toBe(200);
      expect(res.body.cartItem.pieces).toBe(4);
    });

    it("should return 403 when updating another user's item", async () => {
      const otherUser = await User.create({
        name: "Other",
        email: `other+${Date.now()}@example.com`,
        password_hash: "hash",
      });
      const cartItem = await Cart.create({
        user_id: otherUser._id,
        product_id: pieceableProduct._id,
        pieces: 2,
        quantity: 2,
        kilo: 0,
      });

      const res = await request(app)
        .patch(`/api/v1/carts/${cartItem._id.toString()}`)
        .set("x-test-user-id", user._id.toString())
        .send({ pieces: 4 });

      expect(res.status).toBe(403);
    });
  });

  describe("DELETE /api/v1/carts/:id", () => {
    it("should delete a user's cart item", async () => {
      const cartItem = await Cart.create({
        user_id: user._id,
        product_id: pieceableProduct._id,
        pieces: 1,
        quantity: 1,
        kilo: 0,
      });

      const res = await request(app)
        .delete(`/api/v1/carts/${cartItem._id.toString()}`)
        .set("x-test-user-id", user._id.toString());

      expect(res.status).toBe(200);
      expect(res.body.cartItem._id).toBe(cartItem._id.toString());

      const found = await Cart.findById(cartItem._id);
      expect(found).toBeNull();
    });

    it("should return 403 when deleting another user's item", async () => {
      const otherUser = await User.create({
        name: "Other 2",
        email: `other2+${Date.now()}@example.com`,
        password_hash: "hash",
      });
      const cartItem = await Cart.create({
        user_id: otherUser._id,
        product_id: pieceableProduct._id,
        pieces: 2,
        quantity: 2,
        kilo: 0,
      });

      const res = await request(app)
        .delete(`/api/v1/carts/${cartItem._id.toString()}`)
        .set("x-test-user-id", user._id.toString());

      expect(res.status).toBe(403);
    });
  });

  describe("DELETE /api/v1/carts/clear", () => {
    it("should clear a user's cart", async () => {
      await Cart.create({
        user_id: user._id,
        product_id: kiloProduct._id,
        kilo: 1,
        quantity: 1,
      });
      await Cart.create({
        user_id: user._id,
        product_id: pieceableProduct._id,
        pieces: 2,
        quantity: 2,
        kilo: 0,
      });

      const res = await request(app)
        .delete("/api/v1/carts/clear")
        .set("x-test-user-id", user._id.toString());

      // previously we logged the response body here while debugging a route matching issue

      expect(res.status).toBe(200);
      const items = await Cart.find({ user_id: user._id });
      expect(items.length).toBe(0);
    });
  });
});

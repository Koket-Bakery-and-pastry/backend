"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var supertest_1 = __importDefault(require("supertest"));
var app_1 = __importDefault(require("../../src/app"));
var user_model_1 = __importDefault(require("../../src/database/models/user.model"));
var category_model_1 = __importDefault(require("../../src/database/models/category.model"));
var subcategory_model_1 = __importDefault(require("../../src/database/models/subcategory.model"));
var product_model_1 = __importDefault(require("../../src/database/models/product.model"));
var cart_model_1 = __importDefault(require("../../src/database/models/cart.model"));
var mongoose_1 = require("mongoose");
describe("Carts API", function () {
    var user;
    var category;
    var subcategory;
    var kiloProduct;
    var pieceableProduct;
    beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, user_model_1.default.create({
                        name: "Test User",
                        email: "test+".concat(Date.now(), "@example.com"),
                        password_hash: "hash",
                    })];
                case 1:
                    // Create a user
                    user = _a.sent();
                    return [4 /*yield*/, category_model_1.default.create({ name: "Cakes" })];
                case 2:
                    category = _a.sent();
                    return [4 /*yield*/, subcategory_model_1.default.create({
                            category_id: category._id,
                            name: "Chocolate",
                        })];
                case 3:
                    subcategory = _a.sent();
                    return [4 /*yield*/, product_model_1.default.create({
                            name: "Kilo Cake",
                            category_id: category._id,
                            subcategory_id: subcategory._id,
                            is_pieceable: false,
                            kilo_to_price_map: { "1kg": 500, "2kg": 900 },
                        })];
                case 4:
                    kiloProduct = _a.sent();
                    return [4 /*yield*/, product_model_1.default.create({
                            name: "Pieceable Cake",
                            category_id: category._id,
                            subcategory_id: subcategory._id,
                            is_pieceable: true,
                            pieces: 12,
                        })];
                case 5:
                    pieceableProduct = _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    afterEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // Clear carts collection explicitly
                return [4 /*yield*/, cart_model_1.default.deleteMany({})];
                case 1:
                    // Clear carts collection explicitly
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    describe("POST /api/v1/carts", function () {
        it("should add a kilo-based product to cart", function () { return __awaiter(void 0, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                            .post("/api/v1/carts")
                            .set("x-test-user-id", user._id.toString())
                            .send({
                            product_id: kiloProduct._id.toString(),
                            kilo: 1,
                            quantity: 1,
                        })];
                    case 1:
                        res = _a.sent();
                        expect(res.status).toBe(201);
                        expect(res.body.message).toBe("Cart item added/updated successfully");
                        expect(res.body.cartItem).toHaveProperty("_id");
                        expect(res.body.cartItem.product_id.toString()).toBe(kiloProduct._id.toString());
                        expect(res.body.cartItem.kilo).toBe(1);
                        return [2 /*return*/];
                }
            });
        }); });
        it("should add a pieceable product to cart", function () { return __awaiter(void 0, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                            .post("/api/v1/carts")
                            .set("x-test-user-id", user._id.toString())
                            .send({
                            product_id: pieceableProduct._id.toString(),
                            pieces: 2,
                        })];
                    case 1:
                        res = _a.sent();
                        expect(res.status).toBe(201);
                        expect(res.body.cartItem).toHaveProperty("_id");
                        expect(res.body.cartItem.product_id.toString()).toBe(pieceableProduct._id.toString());
                        expect(res.body.cartItem.pieces).toBe(2);
                        return [2 /*return*/];
                }
            });
        }); });
        it("should merge duplicate cart adds (update existing item)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var r1, r2, cartItems;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                            .post("/api/v1/carts")
                            .set("x-test-user-id", user._id.toString())
                            .send({
                            product_id: kiloProduct._id.toString(),
                            kilo: 1,
                            quantity: 1,
                        })];
                    case 1:
                        r1 = _a.sent();
                        expect(r1.status).toBe(201);
                        return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                                .post("/api/v1/carts")
                                .set("x-test-user-id", user._id.toString())
                                .send({
                                product_id: kiloProduct._id.toString(),
                                kilo: 1,
                                quantity: 2,
                            })];
                    case 2:
                        r2 = _a.sent();
                        expect(r2.status).toBe(201);
                        return [4 /*yield*/, cart_model_1.default.find({ user_id: user._id })];
                    case 3:
                        cartItems = _a.sent();
                        expect(cartItems.length).toBe(1);
                        expect(cartItems[0].quantity).toBe(2);
                        return [2 /*return*/];
                }
            });
        }); });
        it("should return 400 for invalid payload", function () { return __awaiter(void 0, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                            .post("/api/v1/carts")
                            .set("x-test-user-id", user._id.toString())
                            .send({
                            // missing product_id
                            kilo: 1,
                        })];
                    case 1:
                        res = _a.sent();
                        expect(res.status).toBe(400);
                        expect(res.body.message).toContain("Product ID is required");
                        return [2 /*return*/];
                }
            });
        }); });
        it("should return 404 if product does not exist", function () { return __awaiter(void 0, void 0, void 0, function () {
            var fakeId, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fakeId = new mongoose_1.Types.ObjectId().toString();
                        return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                                .post("/api/v1/carts")
                                .set("x-test-user-id", user._id.toString())
                                .send({
                                product_id: fakeId,
                                kilo: 1,
                            })];
                    case 1:
                        res = _a.sent();
                        expect(res.status).toBe(404);
                        expect(res.body.message).toContain("Product with ID");
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe("GET /api/v1/carts", function () {
        it("should retrieve user cart items", function () { return __awaiter(void 0, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Seed cart
                    return [4 /*yield*/, cart_model_1.default.create({
                            user_id: user._id,
                            product_id: kiloProduct._id,
                            kilo: 1,
                            quantity: 1,
                        })];
                    case 1:
                        // Seed cart
                        _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                                .get("/api/v1/carts")
                                .set("x-test-user-id", user._id.toString())];
                    case 2:
                        res = _a.sent();
                        expect(res.status).toBe(200);
                        expect(res.body.cartItems).toHaveLength(1);
                        expect(res.body.cartItems[0].product_id._id.toString()).toBe(kiloProduct._id.toString());
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe("PATCH /api/v1/carts/:id", function () {
        it("should update a cart item when authorized", function () { return __awaiter(void 0, void 0, void 0, function () {
            var cartItem, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, cart_model_1.default.create({
                            user_id: user._id,
                            product_id: pieceableProduct._id,
                            pieces: 2,
                            quantity: 2,
                            kilo: 0,
                        })];
                    case 1:
                        cartItem = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                                .patch("/api/v1/carts/".concat(cartItem._id.toString()))
                                .set("x-test-user-id", user._id.toString())
                                .send({ pieces: 4 })];
                    case 2:
                        res = _a.sent();
                        expect(res.status).toBe(200);
                        expect(res.body.cartItem.pieces).toBe(4);
                        return [2 /*return*/];
                }
            });
        }); });
        it("should return 403 when updating another user's item", function () { return __awaiter(void 0, void 0, void 0, function () {
            var otherUser, cartItem, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, user_model_1.default.create({
                            name: "Other",
                            email: "other+".concat(Date.now(), "@example.com"),
                            password_hash: "hash",
                        })];
                    case 1:
                        otherUser = _a.sent();
                        return [4 /*yield*/, cart_model_1.default.create({
                                user_id: otherUser._id,
                                product_id: pieceableProduct._id,
                                pieces: 2,
                                quantity: 2,
                                kilo: 0,
                            })];
                    case 2:
                        cartItem = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                                .patch("/api/v1/carts/".concat(cartItem._id.toString()))
                                .set("x-test-user-id", user._id.toString())
                                .send({ pieces: 4 })];
                    case 3:
                        res = _a.sent();
                        expect(res.status).toBe(403);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe("DELETE /api/v1/carts/:id", function () {
        it("should delete a user's cart item", function () { return __awaiter(void 0, void 0, void 0, function () {
            var cartItem, res, found;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, cart_model_1.default.create({
                            user_id: user._id,
                            product_id: pieceableProduct._id,
                            pieces: 1,
                            quantity: 1,
                            kilo: 0,
                        })];
                    case 1:
                        cartItem = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                                .delete("/api/v1/carts/".concat(cartItem._id.toString()))
                                .set("x-test-user-id", user._id.toString())];
                    case 2:
                        res = _a.sent();
                        expect(res.status).toBe(200);
                        expect(res.body.cartItem._id).toBe(cartItem._id.toString());
                        return [4 /*yield*/, cart_model_1.default.findById(cartItem._id)];
                    case 3:
                        found = _a.sent();
                        expect(found).toBeNull();
                        return [2 /*return*/];
                }
            });
        }); });
        it("should return 403 when deleting another user's item", function () { return __awaiter(void 0, void 0, void 0, function () {
            var otherUser, cartItem, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, user_model_1.default.create({
                            name: "Other 2",
                            email: "other2+".concat(Date.now(), "@example.com"),
                            password_hash: "hash",
                        })];
                    case 1:
                        otherUser = _a.sent();
                        return [4 /*yield*/, cart_model_1.default.create({
                                user_id: otherUser._id,
                                product_id: pieceableProduct._id,
                                pieces: 2,
                                quantity: 2,
                                kilo: 0,
                            })];
                    case 2:
                        cartItem = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                                .delete("/api/v1/carts/".concat(cartItem._id.toString()))
                                .set("x-test-user-id", user._id.toString())];
                    case 3:
                        res = _a.sent();
                        expect(res.status).toBe(403);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe("DELETE /api/v1/carts/clear", function () {
        it("should clear a user's cart", function () { return __awaiter(void 0, void 0, void 0, function () {
            var res, items;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, cart_model_1.default.create({
                            user_id: user._id,
                            product_id: kiloProduct._id,
                            kilo: 1,
                            quantity: 1,
                        })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, cart_model_1.default.create({
                                user_id: user._id,
                                product_id: pieceableProduct._id,
                                pieces: 2,
                                quantity: 2,
                                kilo: 0,
                            })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                                .delete("/api/v1/carts/clear")
                                .set("x-test-user-id", user._id.toString())];
                    case 3:
                        res = _a.sent();
                        // previously we logged the response body here while debugging a route matching issue
                        expect(res.status).toBe(200);
                        return [4 /*yield*/, cart_model_1.default.find({ user_id: user._id })];
                    case 4:
                        items = _a.sent();
                        expect(items.length).toBe(0);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});

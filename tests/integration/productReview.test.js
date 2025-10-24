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
var category_model_1 = __importDefault(require("../../src/database/models/category.model"));
var subcategory_model_1 = __importDefault(require("../../src/database/models/subcategory.model"));
var product_model_1 = __importDefault(require("../../src/database/models/product.model"));
var user_model_1 = __importDefault(require("../../src/database/models/user.model")); // Assuming User model is available
var productReview_model_1 = __importDefault(require("../../src/database/models/productReview.model"));
describe("Product Review API", function () {
    var category;
    var subcategory;
    var product;
    var user;
    var user2;
    // Setup parent entities before each test
    beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, category_model_1.default.create({ name: "Test Category" })];
                case 1:
                    category = _a.sent();
                    return [4 /*yield*/, subcategory_model_1.default.create({
                            category_id: category._id,
                            name: "Test Subcategory",
                        })];
                case 2:
                    subcategory = _a.sent();
                    return [4 /*yield*/, product_model_1.default.create({
                            name: "Test Product",
                            category_id: category._id,
                            subcategory_id: subcategory._id,
                            is_pieceable: false,
                            kilo_to_price_map: { "1kg": 500 },
                        })];
                case 3:
                    product = _a.sent();
                    return [4 /*yield*/, user_model_1.default.create({
                            name: "Test User",
                            email: "testuser@example.com",
                            password_hash: "hashedpassword1",
                            role: "customer",
                        })];
                case 4:
                    user = _a.sent();
                    return [4 /*yield*/, user_model_1.default.create({
                            name: "Another User",
                            email: "anotheruser@example.com",
                            password_hash: "hashedpassword2",
                            role: "customer",
                        })];
                case 5:
                    user2 = _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    // Test POST /api/v1/reviews - Create new review
    it("should create a new product review", function () { return __awaiter(void 0, void 0, void 0, function () {
        var res, createdReview;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, supertest_1.default)(app_1.default).post("/api/v1/reviews").send({
                        product_id: product._id.toString(),
                        user_id: user._id.toString(),
                        rating: 5,
                        comment: "Absolutely delicious!",
                    })];
                case 1:
                    res = _a.sent();
                    expect(res.status).toBe(201);
                    expect(res.body.message).toBe("Product review created/updated successfully");
                    expect(res.body.review).toHaveProperty("_id");
                    expect(res.body.review.rating).toBe(5);
                    expect(res.body.review.comment).toBe("Absolutely delicious!");
                    expect(res.body.review.product_id).toBe(product._id.toString());
                    expect(res.body.review.user_id).toBe(user._id.toString());
                    return [4 /*yield*/, productReview_model_1.default.findById(res.body.review._id)];
                case 2:
                    createdReview = _a.sent();
                    expect(createdReview).not.toBeNull();
                    return [2 /*return*/];
            }
        });
    }); });
    it("should return 400 if required fields are missing during review creation", function () { return __awaiter(void 0, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, supertest_1.default)(app_1.default).post("/api/v1/reviews").send({
                        product_id: product._id.toString(),
                        user_id: user._id.toString(),
                        // rating is missing
                    })];
                case 1:
                    res = _a.sent();
                    expect(res.status).toBe(400);
                    expect(res.body.message).toContain("Rating must be at least 1.");
                    return [2 /*return*/];
            }
        });
    }); });
    it("should return 404 if product does not exist for review", function () { return __awaiter(void 0, void 0, void 0, function () {
        var nonExistentProductId, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    nonExistentProductId = "60a7e1f4b0d8a5001f8e1a1a";
                    return [4 /*yield*/, (0, supertest_1.default)(app_1.default).post("/api/v1/reviews").send({
                            product_id: nonExistentProductId,
                            user_id: user._id.toString(),
                            rating: 4,
                        })];
                case 1:
                    res = _a.sent();
                    expect(res.status).toBe(404);
                    expect(res.body.message).toBe("Product with ID '".concat(nonExistentProductId, "' not found."));
                    return [2 /*return*/];
            }
        });
    }); });
    it("should return 404 if user does not exist for review", function () { return __awaiter(void 0, void 0, void 0, function () {
        var nonExistentUserId, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    nonExistentUserId = "60a7e1f4b0d8a5001f8e1a1b";
                    return [4 /*yield*/, (0, supertest_1.default)(app_1.default).post("/api/v1/reviews").send({
                            product_id: product._id.toString(),
                            user_id: nonExistentUserId,
                            rating: 3,
                        })];
                case 1:
                    res = _a.sent();
                    expect(res.status).toBe(404);
                    expect(res.body.message).toBe("User with ID '".concat(nonExistentUserId, "' not found."));
                    return [2 /*return*/];
            }
        });
    }); });
    // Test POST /api/v1/reviews - Update existing review
    it("should update an existing product review if user reviews same product again", function () { return __awaiter(void 0, void 0, void 0, function () {
        var res, reviews;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // First review
                return [4 /*yield*/, (0, supertest_1.default)(app_1.default).post("/api/v1/reviews").send({
                        product_id: product._id.toString(),
                        user_id: user._id.toString(),
                        rating: 3,
                        comment: "It was okay.",
                    })];
                case 1:
                    // First review
                    _a.sent();
                    return [4 /*yield*/, (0, supertest_1.default)(app_1.default).post("/api/v1/reviews").send({
                            product_id: product._id.toString(),
                            user_id: user._id.toString(),
                            rating: 4,
                            comment: "Better than I thought!",
                        })];
                case 2:
                    res = _a.sent();
                    expect(res.status).toBe(201); // Still 201 as it's a "createOrUpdate" endpoint
                    expect(res.body.message).toBe("Product review created/updated successfully");
                    expect(res.body.review.rating).toBe(4);
                    expect(res.body.review.comment).toBe("Better than I thought!");
                    return [4 /*yield*/, productReview_model_1.default.find({
                            product_id: product._id,
                            user_id: user._id,
                        })];
                case 3:
                    reviews = _a.sent();
                    expect(reviews).toHaveLength(1);
                    return [2 /*return*/];
            }
        });
    }); });
    // Test GET /api/v1/reviews
    it("should retrieve all product reviews", function () { return __awaiter(void 0, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, productReview_model_1.default.create({
                        product_id: product._id,
                        user_id: user._id,
                        rating: 5,
                    })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, productReview_model_1.default.create({
                            product_id: product._id,
                            user_id: user2._id,
                            rating: 4,
                        })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, supertest_1.default)(app_1.default).get("/api/v1/reviews")];
                case 3:
                    res = _a.sent();
                    expect(res.status).toBe(200);
                    expect(res.body.message).toBe("Product reviews fetched successfully");
                    expect(res.body.reviews).toHaveLength(2);
                    expect(res.body.reviews[0].rating).toBe(5);
                    expect(res.body.reviews[1].rating).toBe(4);
                    return [2 /*return*/];
            }
        });
    }); });
    it("should retrieve product reviews filtered by productId", function () { return __awaiter(void 0, void 0, void 0, function () {
        var product2, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, product_model_1.default.create({
                        name: "Another Product",
                        category_id: category._id,
                        subcategory_id: subcategory._id,
                        is_pieceable: true,
                        pieces: 10,
                    })];
                case 1:
                    product2 = _a.sent();
                    return [4 /*yield*/, productReview_model_1.default.create({
                            product_id: product._id,
                            user_id: user._id,
                            rating: 5,
                        })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, productReview_model_1.default.create({
                            product_id: product2._id,
                            user_id: user2._id,
                            rating: 3,
                        })];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, (0, supertest_1.default)(app_1.default).get("/api/v1/reviews?productId=".concat(product._id.toString()))];
                case 4:
                    res = _a.sent();
                    expect(res.status).toBe(200);
                    expect(res.body.message).toBe("Product reviews fetched successfully");
                    expect(res.body.reviews).toHaveLength(1);
                    expect(res.body.reviews[0].product_id).toBe(product._id.toString());
                    return [2 /*return*/];
            }
        });
    }); });
    it("should retrieve product reviews filtered by userId", function () { return __awaiter(void 0, void 0, void 0, function () {
        var product2, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, product_model_1.default.create({
                        name: "Another Product 2",
                        category_id: category._id,
                        subcategory_id: subcategory._id,
                        is_pieceable: true,
                        pieces: 10,
                    })];
                case 1:
                    product2 = _a.sent();
                    return [4 /*yield*/, productReview_model_1.default.create({
                            product_id: product._id,
                            user_id: user._id,
                            rating: 5,
                        })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, productReview_model_1.default.create({
                            product_id: product2._id,
                            user_id: user2._id,
                            rating: 3,
                        })];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, (0, supertest_1.default)(app_1.default).get("/api/v1/reviews?userId=".concat(user._id.toString()))];
                case 4:
                    res = _a.sent();
                    expect(res.status).toBe(200);
                    expect(res.body.message).toBe("Product reviews fetched successfully");
                    expect(res.body.reviews).toHaveLength(1);
                    expect(res.body.reviews[0].user_id).toBe(user._id.toString());
                    return [2 /*return*/];
            }
        });
    }); });
});

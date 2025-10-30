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
describe("Product API", function () {
    var parentCategory;
    var parentSubcategory;
    var anotherCategory;
    var anotherSubcategory;
    beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, category_model_1.default.create({
                        name: "Cakes",
                        description: "All kinds of cakes",
                    })];
                case 1:
                    parentCategory = _a.sent();
                    return [4 /*yield*/, subcategory_model_1.default.create({
                            category_id: parentCategory._id,
                            name: "Chocolate Cakes",
                        })];
                case 2:
                    parentSubcategory = _a.sent();
                    return [4 /*yield*/, category_model_1.default.create({
                            name: "Pastries",
                            description: "Sweet and savory pastries",
                        })];
                case 3:
                    anotherCategory = _a.sent();
                    return [4 /*yield*/, subcategory_model_1.default.create({
                            category_id: anotherCategory._id,
                            name: "Croissants",
                        })];
                case 4:
                    anotherSubcategory = _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    // --- POST /api/v1/products ---
    describe("POST /api/v1/products", function () {
        it("should create a new kilo-based product", function () { return __awaiter(void 0, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                            .post("/api/v1/products")
                            .send({
                            name: "Dark Chocolate Cake",
                            category_id: parentCategory._id.toString(),
                            subcategory_id: parentSubcategory._id.toString(),
                            description: "Rich and moist dark chocolate cake.",
                            kilo_to_price_map: { "0.5kg": 300, "1kg": 550, "1.5kg": 800 },
                            is_pieceable: false,
                            upfront_payment: 100, // Fixed amount
                        })];
                    case 1:
                        res = _a.sent();
                        expect(res.status).toBe(201);
                        expect(res.body.message).toBe("Product created successfully");
                        expect(res.body.product).toHaveProperty("_id");
                        expect(res.body.product.name).toBe("Dark Chocolate Cake");
                        expect(res.body.product.is_pieceable).toBe(false);
                        expect(res.body.product.kilo_to_price_map["1kg"]).toBe(550);
                        expect(res.body.product.upfront_payment).toBe(100);
                        expect(res.body.product.pieces).toBeUndefined(); // Should not have pieces
                        return [2 /*return*/];
                }
            });
        }); });
        it("should create a new pieceable product", function () { return __awaiter(void 0, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(app_1.default).post("/api/v1/products").send({
                            name: "Vanilla Cupcake",
                            image_url: "http://example.com/vanilla.jpg",
                            category_id: parentCategory._id.toString(),
                            subcategory_id: parentSubcategory._id.toString(),
                            description: "Classic vanilla cupcake with buttercream.",
                            is_pieceable: true,
                            pieces: 12,
                            upfront_payment: 50, // Percentage
                        })];
                    case 1:
                        res = _a.sent();
                        expect(res.status).toBe(201);
                        expect(res.body.message).toBe("Product created successfully");
                        expect(res.body.product.name).toBe("Vanilla Cupcake");
                        expect(res.body.product.is_pieceable).toBe(true);
                        expect(res.body.product.pieces).toBe(12);
                        expect(res.body.product.kilo_to_price_map).toBeInstanceOf(Object); // Should be an empty object/map
                        expect(Object.keys(res.body.product.kilo_to_price_map).length).toBe(0);
                        return [2 /*return*/];
                }
            });
        }); });
        it("should return 400 if required fields are missing", function () { return __awaiter(void 0, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                            .post("/api/v1/products")
                            .send({
                            name: "Missing Info Cake",
                            category_id: parentCategory._id.toString(),
                            // subcategory_id is missing
                            is_pieceable: false,
                            kilo_to_price_map: { "1kg": 500 },
                        })];
                    case 1:
                        res = _a.sent();
                        expect(res.status).toBe(400);
                        expect(res.body.message).toContain("Subcategory ID is required.");
                        return [2 /*return*/];
                }
            });
        }); });
        it("should return 400 for invalid pricing configuration (not pieceable, no kilo map)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(app_1.default).post("/api/v1/products").send({
                            name: "Invalid Cake",
                            category_id: parentCategory._id.toString(),
                            subcategory_id: parentSubcategory._id.toString(),
                            is_pieceable: false,
                            // kilo_to_price_map is missing or empty
                        })];
                    case 1:
                        res = _a.sent();
                        expect(res.status).toBe(400);
                        expect(res.body.message).toContain("Product must be either pieceable");
                        return [2 /*return*/];
                }
            });
        }); });
        it("should return 400 for invalid pricing configuration (pieceable, no pieces)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(app_1.default).post("/api/v1/products").send({
                            name: "Invalid Cupcake",
                            category_id: parentCategory._id.toString(),
                            subcategory_id: parentSubcategory._id.toString(),
                            is_pieceable: true,
                            // pieces is missing
                        })];
                    case 1:
                        res = _a.sent();
                        expect(res.status).toBe(400);
                        expect(res.body.message).toContain("Product must be either pieceable");
                        return [2 /*return*/];
                }
            });
        }); });
        it("should return 404 if parent category does not exist", function () { return __awaiter(void 0, void 0, void 0, function () {
            var nonExistentId, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        nonExistentId = "60a7e1f4b0d8a5001f8e1a1a";
                        return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                                .post("/api/v1/products")
                                .send({
                                name: "Orphan Cake",
                                category_id: nonExistentId,
                                subcategory_id: parentSubcategory._id.toString(),
                                is_pieceable: false,
                                kilo_to_price_map: { "1kg": 500 },
                            })];
                    case 1:
                        res = _a.sent();
                        expect(res.status).toBe(404);
                        expect(res.body.message).toContain("Category with ID '".concat(nonExistentId, "' not found."));
                        return [2 /*return*/];
                }
            });
        }); });
        it("should return 404 if parent subcategory does not exist", function () { return __awaiter(void 0, void 0, void 0, function () {
            var nonExistentId, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        nonExistentId = "60a7e1f4b0d8a5001f8e1a1b";
                        return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                                .post("/api/v1/products")
                                .send({
                                name: "Sub-Orphan Cake",
                                category_id: parentCategory._id.toString(),
                                subcategory_id: nonExistentId,
                                is_pieceable: false,
                                kilo_to_price_map: { "1kg": 500 },
                            })];
                    case 1:
                        res = _a.sent();
                        expect(res.status).toBe(404);
                        expect(res.body.message).toContain("Subcategory with ID '".concat(nonExistentId, "' not found."));
                        return [2 /*return*/];
                }
            });
        }); });
        it("should return 400 if subcategory does not belong to category", function () { return __awaiter(void 0, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                            .post("/api/v1/products")
                            .send({
                            name: "Mismatched Cake",
                            category_id: parentCategory._id.toString(), // Cakes
                            subcategory_id: anotherSubcategory._id.toString(), // Croissants (belongs to Pastries)
                            is_pieceable: false,
                            kilo_to_price_map: { "1kg": 500 },
                        })];
                    case 1:
                        res = _a.sent();
                        expect(res.status).toBe(400);
                        expect(res.body.message).toContain("Subcategory with ID '".concat(anotherSubcategory._id.toString(), "' does not belong to Category with ID '").concat(parentCategory._id.toString(), "'."));
                        return [2 /*return*/];
                }
            });
        }); });
        it("should return 409 if a product with the same name exists in the same category/subcategory", function () { return __awaiter(void 0, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, product_model_1.default.create({
                            name: "Strawberry Delight",
                            category_id: parentCategory._id,
                            subcategory_id: parentSubcategory._id,
                            is_pieceable: false,
                            kilo_to_price_map: { "1kg": 600 },
                        })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                                .post("/api/v1/products")
                                .send({
                                name: "Strawberry Delight", // Duplicate name
                                category_id: parentCategory._id.toString(),
                                subcategory_id: parentSubcategory._id.toString(),
                                is_pieceable: false,
                                kilo_to_price_map: { "0.5kg": 300 },
                            })];
                    case 2:
                        res = _a.sent();
                        expect(res.status).toBe(409);
                        expect(res.body.message).toContain("Product with name 'Strawberry Delight' already exists in this category/subcategory.");
                        return [2 /*return*/];
                }
            });
        }); });
    });
    // --- GET /api/v1/products ---
    describe("GET /api/v1/products", function () {
        it("should retrieve all products", function () { return __awaiter(void 0, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, product_model_1.default.create({
                            name: "Lemon Meringue Pie",
                            category_id: parentCategory._id,
                            subcategory_id: parentSubcategory._id,
                            is_pieceable: true,
                            pieces: 8,
                        })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, product_model_1.default.create({
                                name: "Almond Croissant",
                                category_id: anotherCategory._id,
                                subcategory_id: anotherSubcategory._id,
                                is_pieceable: true,
                                pieces: 1,
                            })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(app_1.default).get("/api/v1/products")];
                    case 3:
                        res = _a.sent();
                        expect(res.status).toBe(200);
                        expect(res.body.products).toHaveLength(2);
                        expect(res.body.products.map(function (p) { return p.name; })).toEqual(expect.arrayContaining(["Lemon Meringue Pie", "Almond Croissant"]));
                        return [2 /*return*/];
                }
            });
        }); });
        it("should retrieve products filtered by categoryId", function () { return __awaiter(void 0, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, product_model_1.default.create({
                            name: "Red Velvet Cake",
                            category_id: parentCategory._id,
                            subcategory_id: parentSubcategory._id,
                            is_pieceable: false,
                            kilo_to_price_map: { "1kg": 700 },
                        })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, product_model_1.default.create({
                                name: "Pain au Chocolat",
                                category_id: anotherCategory._id,
                                subcategory_id: anotherSubcategory._id,
                                is_pieceable: true,
                                pieces: 1,
                            })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(app_1.default).get("/api/v1/products?categoryId=".concat(parentCategory._id.toString()))];
                    case 3:
                        res = _a.sent();
                        expect(res.status).toBe(200);
                        expect(res.body.products).toHaveLength(1);
                        expect(res.body.products[0].name).toBe("Red Velvet Cake");
                        return [2 /*return*/];
                }
            });
        }); });
        it("should retrieve products filtered by subcategoryId", function () { return __awaiter(void 0, void 0, void 0, function () {
            var cheesecakeSub, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, subcategory_model_1.default.create({
                            category_id: parentCategory._id,
                            name: "Cheesecakes",
                        })];
                    case 1:
                        cheesecakeSub = _a.sent();
                        return [4 /*yield*/, product_model_1.default.create({
                                name: "New York Cheesecake",
                                category_id: parentCategory._id,
                                subcategory_id: cheesecakeSub._id,
                                is_pieceable: false,
                                kilo_to_price_map: { "1kg": 900 },
                            })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, product_model_1.default.create({
                                name: "Opera Cake",
                                category_id: parentCategory._id,
                                subcategory_id: parentSubcategory._id,
                                is_pieceable: false,
                                kilo_to_price_map: { "1kg": 850 },
                            })];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(app_1.default).get("/api/v1/products?subcategoryId=".concat(cheesecakeSub._id.toString()))];
                    case 4:
                        res = _a.sent();
                        expect(res.status).toBe(200);
                        expect(res.body.products).toHaveLength(1);
                        expect(res.body.products[0].name).toBe("New York Cheesecake");
                        return [2 /*return*/];
                }
            });
        }); });
        it("should return 404 if filtered by non-existent categoryId", function () { return __awaiter(void 0, void 0, void 0, function () {
            var nonExistentId, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        nonExistentId = "60a7e1f4b0d8a5001f8e1a22";
                        return [4 /*yield*/, (0, supertest_1.default)(app_1.default).get("/api/v1/products?categoryId=".concat(nonExistentId))];
                    case 1:
                        res = _a.sent();
                        expect(res.status).toBe(404);
                        expect(res.body.message).toContain("Category with ID '".concat(nonExistentId, "' not found."));
                        return [2 /*return*/];
                }
            });
        }); });
    });
    // --- GET /api/v1/products/:id ---
    describe("GET /api/v1/products/:id", function () {
        it("should retrieve a product by ID", function () { return __awaiter(void 0, void 0, void 0, function () {
            var newProduct, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, product_model_1.default.create({
                            name: "Fudge Brownie",
                            category_id: parentCategory._id,
                            subcategory_id: parentSubcategory._id,
                            is_pieceable: true,
                            pieces: 1,
                            upfront_payment: 10,
                        })];
                    case 1:
                        newProduct = (_a.sent());
                        return [4 /*yield*/, (0, supertest_1.default)(app_1.default).get("/api/v1/products/".concat(newProduct._id.toString()))];
                    case 2:
                        res = _a.sent();
                        expect(res.status).toBe(200);
                        expect(res.body.message).toBe("Product retrieved successfully");
                        expect(res.body.product.name).toBe("Fudge Brownie");
                        expect(res.body.product.is_pieceable).toBe(true);
                        expect(res.body.product.pieces).toBe(1);
                        return [2 /*return*/];
                }
            });
        }); });
        it("should return 404 if product ID is not found", function () { return __awaiter(void 0, void 0, void 0, function () {
            var nonExistentId, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        nonExistentId = "60a7e1f4b0d8a5001f8e1a23";
                        return [4 /*yield*/, (0, supertest_1.default)(app_1.default).get("/api/v1/products/".concat(nonExistentId))];
                    case 1:
                        res = _a.sent();
                        expect(res.status).toBe(404);
                        expect(res.body.message).toBe("Product with ID '".concat(nonExistentId, "' not found."));
                        return [2 /*return*/];
                }
            });
        }); });
        it("should return 400 for an invalid product ID format", function () { return __awaiter(void 0, void 0, void 0, function () {
            var invalidId, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        invalidId = "invalid-product-id";
                        return [4 /*yield*/, (0, supertest_1.default)(app_1.default).get("/api/v1/products/".concat(invalidId))];
                    case 1:
                        res = _a.sent();
                        expect(res.status).toBe(400);
                        expect(res.body.message).toContain("Invalid MongoDB ObjectId format");
                        return [2 /*return*/];
                }
            });
        }); });
    });
    // --- PUT /api/v1/products/:id ---
    describe("PUT /api/v1/products/:id", function () {
        var existingProduct;
        beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, product_model_1.default.create({
                            name: "Original Cake",
                            category_id: parentCategory._id,
                            subcategory_id: parentSubcategory._id,
                            is_pieceable: false,
                            kilo_to_price_map: { "1kg": 500 },
                            upfront_payment: 50,
                        })];
                    case 1:
                        existingProduct = (_a.sent());
                        return [2 /*return*/];
                }
            });
        }); });
        it("should update a product name and description", function () { return __awaiter(void 0, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                            .put("/api/v1/products/".concat(existingProduct._id.toString()))
                            .send({ name: "Updated Cake Name", description: "New Description" })];
                    case 1:
                        res = _a.sent();
                        expect(res.status).toBe(200);
                        expect(res.body.message).toBe("Product updated successfully");
                        expect(res.body.product.name).toBe("Updated Cake Name");
                        expect(res.body.product.description).toBe("New Description");
                        expect(res.body.product.kilo_to_price_map["1kg"]).toBe(500); // Should remain same
                        return [2 /*return*/];
                }
            });
        }); });
        it("should update kilo_to_price_map", function () { return __awaiter(void 0, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                            .put("/api/v1/products/".concat(existingProduct._id.toString()))
                            .send({ kilo_to_price_map: { "0.5kg": 280, "1kg": 520, "2kg": 1000 } })];
                    case 1:
                        res = _a.sent();
                        expect(res.status).toBe(200);
                        expect(res.body.product.kilo_to_price_map["1kg"]).toBe(520);
                        expect(res.body.product.kilo_to_price_map["2kg"]).toBe(1000);
                        return [2 /*return*/];
                }
            });
        }); });
        it("should switch product to pieceable with pieces", function () { return __awaiter(void 0, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                            .put("/api/v1/products/".concat(existingProduct._id.toString()))
                            .send({ is_pieceable: true, pieces: 6 })];
                    case 1:
                        res = _a.sent();
                        expect(res.status).toBe(200);
                        expect(res.body.product.is_pieceable).toBe(true);
                        expect(res.body.product.pieces).toBe(6);
                        expect(Object.keys(res.body.product.kilo_to_price_map).length).toBe(0); // Should be cleared or ignored in context of pieceable only
                        return [2 /*return*/];
                }
            });
        }); });
        it("should switch product from pieceable to kilo-based with map", function () { return __awaiter(void 0, void 0, void 0, function () {
            var pieceableProduct, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, product_model_1.default.create({
                            name: "Cookies",
                            category_id: parentCategory._id,
                            subcategory_id: parentSubcategory._id,
                            is_pieceable: true,
                            pieces: 12,
                        })];
                    case 1:
                        pieceableProduct = (_a.sent());
                        return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                                .put("/api/v1/products/".concat(pieceableProduct._id.toString()))
                                .send({
                                is_pieceable: false,
                                kilo_to_price_map: { "0.25kg": 150, "0.5kg": 280 },
                            })];
                    case 2:
                        res = _a.sent();
                        expect(res.status).toBe(200);
                        expect(res.body.product.is_pieceable).toBe(false);
                        expect(res.body.product.pieces).toBeNull(); // Pieces should be removed
                        expect(res.body.product.kilo_to_price_map["0.25kg"]).toBe(150);
                        return [2 /*return*/];
                }
            });
        }); });
        it("should return 400 if updating to an invalid pricing configuration (is_pieceable=true, no pieces)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                            .put("/api/v1/products/".concat(existingProduct._id.toString()))
                            .send({ is_pieceable: true })];
                    case 1:
                        res = _a.sent();
                        expect(res.status).toBe(400);
                        expect(res.body.message).toContain("Validation error during update: Product must be either pieceable (with pieces) or sold by kilo (with kilo_to_price_map).");
                        return [2 /*return*/];
                }
            });
        }); });
        it("should return 400 if updating to an invalid pricing configuration (is_pieceable=false, no kilo_to_price_map)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var pieceableProduct, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, product_model_1.default.create({
                            name: "Biscuits",
                            category_id: parentCategory._id,
                            subcategory_id: parentSubcategory._id,
                            is_pieceable: true,
                            pieces: 20,
                        })];
                    case 1:
                        pieceableProduct = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                                .put("/api/v1/products/".concat(pieceableProduct._id.toString()))
                                .send({ is_pieceable: false, kilo_to_price_map: {} })];
                    case 2:
                        res = _a.sent();
                        expect(res.status).toBe(400);
                        expect(res.body.message).toContain("Validation error during update: Product must be either pieceable (with pieces) or sold by kilo (with kilo_to_price_map).");
                        return [2 /*return*/];
                }
            });
        }); });
        it("should return 404 if product to update is not found", function () { return __awaiter(void 0, void 0, void 0, function () {
            var nonExistentId, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        nonExistentId = "60a7e1f4b0d8a5001f8e1a24";
                        return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                                .put("/api/v1/products/".concat(nonExistentId))
                                .send({ name: "Non Existent Product" })];
                    case 1:
                        res = _a.sent();
                        expect(res.status).toBe(404);
                        expect(res.body.message).toBe("Product with ID '".concat(nonExistentId, "' not found for update."));
                        return [2 /*return*/];
                }
            });
        }); });
        it("should return 409 if updating to a name that already exists in the same category/subcategory", function () { return __awaiter(void 0, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, product_model_1.default.create({
                            name: "Conflicting Product",
                            category_id: parentCategory._id,
                            subcategory_id: parentSubcategory._id,
                            is_pieceable: false,
                            kilo_to_price_map: { "1kg": 100 },
                        })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                                .put("/api/v1/products/".concat(existingProduct._id.toString()))
                                .send({ name: "Conflicting Product" })];
                    case 2:
                        res = _a.sent();
                        expect(res.status).toBe(409);
                        expect(res.body.message).toContain("Product with name 'Conflicting Product' already exists in the target category/subcategory.");
                        return [2 /*return*/];
                }
            });
        }); });
        it("should return 400 if changing to non-existent category/subcategory", function () { return __awaiter(void 0, void 0, void 0, function () {
            var nonExistentId, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        nonExistentId = "60a7e1f4b0d8a5001f8e1a25";
                        return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                                .put("/api/v1/products/".concat(existingProduct._id.toString()))
                                .send({ category_id: nonExistentId })];
                    case 1:
                        res = _a.sent();
                        expect(res.status).toBe(404);
                        expect(res.body.message).toContain("Category with ID '".concat(nonExistentId, "' not found."));
                        return [2 /*return*/];
                }
            });
        }); });
    });
    // --- DELETE /api/v1/products/:id ---
    describe("DELETE /api/v1/products/:id", function () {
        it("should delete a product by ID", function () { return __awaiter(void 0, void 0, void 0, function () {
            var newProduct, res, foundProduct;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, product_model_1.default.create({
                            name: "To Be Deleted",
                            category_id: parentCategory._id,
                            subcategory_id: parentSubcategory._id,
                            is_pieceable: true,
                            pieces: 1,
                        })];
                    case 1:
                        newProduct = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(app_1.default).delete("/api/v1/products/".concat(newProduct._id.toString()))];
                    case 2:
                        res = _a.sent();
                        expect(res.status).toBe(200);
                        expect(res.body.message).toBe("Product deleted successfully");
                        expect(res.body.product.name).toBe("To Be Deleted");
                        return [4 /*yield*/, product_model_1.default.findById(newProduct._id)];
                    case 3:
                        foundProduct = _a.sent();
                        expect(foundProduct).toBeNull();
                        return [2 /*return*/];
                }
            });
        }); });
        it("should return 404 if product to delete is not found", function () { return __awaiter(void 0, void 0, void 0, function () {
            var nonExistentId, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        nonExistentId = "60a7e1f4b0d8a5001f8e1a26";
                        return [4 /*yield*/, (0, supertest_1.default)(app_1.default).delete("/api/v1/products/".concat(nonExistentId))];
                    case 1:
                        res = _a.sent();
                        expect(res.status).toBe(404);
                        expect(res.body.message).toBe("Product with ID '".concat(nonExistentId, "' not found for deletion."));
                        return [2 /*return*/];
                }
            });
        }); });
    });
});

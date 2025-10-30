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
var app_1 = __importDefault(require("../../src/app"));
var category_model_1 = __importDefault(require("../../src/database/models/category.model"));
var supertest_1 = __importDefault(require("supertest"));
describe("Category API", function () {
    // Test POST /api/v1/categories
    it("should create a new category", function () { return __awaiter(void 0, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, supertest_1.default)(app_1.default).post("/api/v1/categories").send({
                        name: "Classic Cakes",
                        description: "Traditional and timeless cake flavors.",
                    })];
                case 1:
                    res = _a.sent();
                    expect(res.status).toBe(201);
                    expect(res.body.message).toBe("Category created successfully");
                    expect(res.body.category).toHaveProperty("_id");
                    expect(res.body.category.name).toBe("Classic Cakes");
                    return [2 /*return*/];
            }
        });
    }); });
    it("should return 400 if required fields are missing during creation", function () { return __awaiter(void 0, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, supertest_1.default)(app_1.default).post("/api/v1/categories").send({
                        description: "Missing name",
                    })];
                case 1:
                    res = _a.sent();
                    expect(res.status).toBe(400);
                    expect(res.body.message).toContain("Category name cannot be empty");
                    return [2 /*return*/];
            }
        });
    }); });
    it("should return 409 if a category with the same name already exists", function () { return __awaiter(void 0, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // Create first category
                return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                        .post("/api/v1/categories")
                        .send({ name: "Specialty Desserts", description: "Unique treats" })];
                case 1:
                    // Create first category
                    _a.sent();
                    return [4 /*yield*/, (0, supertest_1.default)(app_1.default).post("/api/v1/categories").send({
                            name: "Specialty Desserts",
                            description: "Another unique treats",
                        })];
                case 2:
                    res = _a.sent();
                    expect(res.status).toBe(409);
                    expect(res.body.message).toContain("Category with name 'Specialty Desserts' already exists.");
                    return [2 /*return*/];
            }
        });
    }); });
    // Test GET /api/v1/categories
    it("should retrieve all categories", function () { return __awaiter(void 0, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // Add some categories first
                return [4 /*yield*/, category_model_1.default.create({
                        name: "Cupcakes",
                        description: "Miniature delights",
                    })];
                case 1:
                    // Add some categories first
                    _a.sent();
                    return [4 /*yield*/, category_model_1.default.create({
                            name: "Pies",
                            description: "Fruit and cream pies",
                        })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, supertest_1.default)(app_1.default).get("/api/v1/categories")];
                case 3:
                    res = _a.sent();
                    expect(res.status).toBe(200);
                    expect(res.body.message).toBe("Categories retrieved successfully");
                    expect(res.body.categories).toHaveLength(2);
                    expect(res.body.categories[0].name).toBe("Cupcakes");
                    expect(res.body.categories[1].name).toBe("Pies");
                    return [2 /*return*/];
            }
        });
    }); });
    // Test GET /api/v1/categories/:id
    it("should retrieve a category by ID", function () { return __awaiter(void 0, void 0, void 0, function () {
        var newCategory, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, category_model_1.default.create({
                        name: "Muffins",
                        description: "Breakfast goods",
                    })];
                case 1:
                    newCategory = _a.sent();
                    return [4 /*yield*/, (0, supertest_1.default)(app_1.default).get("/api/v1/categories/".concat(newCategory._id.toString()))];
                case 2:
                    res = _a.sent();
                    expect(res.status).toBe(200);
                    expect(res.body.message).toBe("Category retrieved successfully");
                    expect(res.body.category.name).toBe("Muffins");
                    return [2 /*return*/];
            }
        });
    }); });
    it("should return 404 if category ID is not found", function () { return __awaiter(void 0, void 0, void 0, function () {
        var nonExistentId, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    nonExistentId = "60a7e1f4b0d8a5001f8e1a1a";
                    return [4 /*yield*/, (0, supertest_1.default)(app_1.default).get("/api/v1/categories/".concat(nonExistentId))];
                case 1:
                    res = _a.sent();
                    expect(res.status).toBe(404);
                    expect(res.body.message).toBe("Category with ID '".concat(nonExistentId, "' not found."));
                    return [2 /*return*/];
            }
        });
    }); });
    it("should return 400 for an invalid category ID format", function () { return __awaiter(void 0, void 0, void 0, function () {
        var invalidId, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    invalidId = "invalid-mongo-id";
                    return [4 /*yield*/, (0, supertest_1.default)(app_1.default).get("/api/v1/categories/".concat(invalidId))];
                case 1:
                    res = _a.sent();
                    expect(res.status).toBe(400);
                    expect(res.body.message).toContain("Invalid MongoDB ObjectId format");
                    return [2 /*return*/];
            }
        });
    }); });
    // Test PUT /api/v1/categories/:id
    it("should update a category by ID", function () { return __awaiter(void 0, void 0, void 0, function () {
        var newCategory, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, category_model_1.default.create({
                        name: "Breads",
                        description: "Artisan breads",
                    })];
                case 1:
                    newCategory = _a.sent();
                    return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                            .put("/api/v1/categories/".concat(newCategory._id.toString()))
                            .send({ name: "Artisan Breads", description: "Hand-crafted loaves" })];
                case 2:
                    res = _a.sent();
                    expect(res.status).toBe(200);
                    expect(res.body.message).toBe("Category updated successfully");
                    expect(res.body.category.name).toBe("Artisan Breads");
                    expect(res.body.category.description).toBe("Hand-crafted loaves");
                    return [2 /*return*/];
            }
        });
    }); });
    it("should return 404 if category to update is not found", function () { return __awaiter(void 0, void 0, void 0, function () {
        var nonExistentId, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    nonExistentId = "60a7e1f4b0d8a5001f8e1a1b";
                    return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                            .put("/api/v1/categories/".concat(nonExistentId))
                            .send({ name: "Non Existent" })];
                case 1:
                    res = _a.sent();
                    expect(res.status).toBe(404);
                    expect(res.body.message).toBe("Category with ID '".concat(nonExistentId, "' not found for update."));
                    return [2 /*return*/];
            }
        });
    }); });
    it("should return 409 if updating to a name that already exists", function () { return __awaiter(void 0, void 0, void 0, function () {
        var secondCategory, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, category_model_1.default.create({
                        name: "First Category",
                        description: "Description 1",
                    })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, category_model_1.default.create({
                            name: "Second Category",
                            description: "Description 2",
                        })];
                case 2:
                    secondCategory = _a.sent();
                    return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                            .put("/api/v1/categories/".concat(secondCategory._id.toString()))
                            .send({ name: "First Category" })];
                case 3:
                    res = _a.sent();
                    expect(res.status).toBe(409);
                    expect(res.body.message).toContain("Category with name 'First Category' already exists.");
                    return [2 /*return*/];
            }
        });
    }); });
    // Test DELETE /api/v1/categories/:id
    it("should delete a category by ID", function () { return __awaiter(void 0, void 0, void 0, function () {
        var newCategory, res, foundCategory;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, category_model_1.default.create({
                        name: "Pastries",
                        description: "Sweet treats",
                    })];
                case 1:
                    newCategory = _a.sent();
                    return [4 /*yield*/, (0, supertest_1.default)(app_1.default).delete("/api/v1/categories/".concat(newCategory._id.toString()))];
                case 2:
                    res = _a.sent();
                    expect(res.status).toBe(200);
                    expect(res.body.message).toBe("Category deleted successfully");
                    expect(res.body.category.name).toBe("Pastries");
                    return [4 /*yield*/, category_model_1.default.findById(newCategory._id)];
                case 3:
                    foundCategory = _a.sent();
                    expect(foundCategory).toBeNull();
                    return [2 /*return*/];
            }
        });
    }); });
    it("should return 404 if category to delete is not found", function () { return __awaiter(void 0, void 0, void 0, function () {
        var nonExistentId, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    nonExistentId = "60a7e1f4b0d8a5001f8e1a1c";
                    return [4 /*yield*/, (0, supertest_1.default)(app_1.default).delete("/api/v1/categories/".concat(nonExistentId))];
                case 1:
                    res = _a.sent();
                    expect(res.status).toBe(404);
                    expect(res.body.message).toBe("Category with ID '".concat(nonExistentId, "' not found for deletion."));
                    return [2 /*return*/];
            }
        });
    }); });
});

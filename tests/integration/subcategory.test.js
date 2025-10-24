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
describe("Subcategory API", function () {
    var parentCategory;
    // Before each test, create a parent category for subcategory operations
    beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, category_model_1.default.create({
                        name: "Baked Goods",
                        description: "Various baked items",
                    })];
                case 1:
                    parentCategory = _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    // Test POST /api/v1/subcategories
    it("should create a new subcategory", function () { return __awaiter(void 0, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, supertest_1.default)(app_1.default).post("/api/v1/subcategories").send({
                        category_id: parentCategory._id.toString(),
                        name: "Chocolate Cakes",
                        status: "available",
                    })];
                case 1:
                    res = _a.sent();
                    expect(res.status).toBe(201);
                    expect(res.body.message).toBe("Subcategory created successfully");
                    expect(res.body.subcategory).toHaveProperty("_id");
                    expect(res.body.subcategory.name).toBe("Chocolate Cakes");
                    expect(res.body.subcategory.category_id).toBe(parentCategory._id.toString());
                    return [2 /*return*/];
            }
        });
    }); });
    it("should return 400 if required fields are missing during creation", function () { return __awaiter(void 0, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, supertest_1.default)(app_1.default).post("/api/v1/subcategories").send({
                        category_id: parentCategory._id.toString(),
                        // name is missing
                    })];
                case 1:
                    res = _a.sent();
                    expect(res.status).toBe(400);
                    expect(res.body.message).toContain("Subcategory name cannot be empty");
                    return [2 /*return*/];
            }
        });
    }); });
    it("should return 404 if parent category does not exist during creation", function () { return __awaiter(void 0, void 0, void 0, function () {
        var nonExistentCategoryId, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    nonExistentCategoryId = "60a7e1f4b0d8a5001f8e1a1d";
                    return [4 /*yield*/, (0, supertest_1.default)(app_1.default).post("/api/v1/subcategories").send({
                            category_id: nonExistentCategoryId,
                            name: "Non Existent Parent Sub",
                        })];
                case 1:
                    res = _a.sent();
                    expect(res.status).toBe(404);
                    expect(res.body.message).toBe("Parent Category with ID '".concat(nonExistentCategoryId, "' not found."));
                    return [2 /*return*/];
            }
        });
    }); });
    it("should return 409 if a subcategory with the same name already exists in the same category", function () { return __awaiter(void 0, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, subcategory_model_1.default.create({
                        category_id: parentCategory._id,
                        name: "Red Velvet",
                        status: "available",
                    })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, supertest_1.default)(app_1.default).post("/api/v1/subcategories").send({
                            category_id: parentCategory._id.toString(),
                            name: "Red Velvet",
                        })];
                case 2:
                    res = _a.sent();
                    expect(res.status).toBe(409);
                    expect(res.body.message).toContain("Subcategory with name 'Red Velvet' already exists in this category.");
                    return [2 /*return*/];
            }
        });
    }); });
    // Test GET /api/v1/subcategories
    it("should retrieve all subcategories", function () { return __awaiter(void 0, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, subcategory_model_1.default.create({
                        category_id: parentCategory._id,
                        name: "Vanilla Cakes",
                    })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, subcategory_model_1.default.create({
                            category_id: parentCategory._id,
                            name: "Fruit Tarts",
                        })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, supertest_1.default)(app_1.default).get("/api/v1/subcategories")];
                case 3:
                    res = _a.sent();
                    expect(res.status).toBe(200);
                    expect(res.body.message).toBe("Subcategories retrieved successfully");
                    expect(res.body.subcategories).toHaveLength(2);
                    expect(res.body.subcategories[0].name).toBe("Vanilla Cakes");
                    return [2 /*return*/];
            }
        });
    }); });
    it("should retrieve subcategories filtered by categoryId", function () { return __awaiter(void 0, void 0, void 0, function () {
        var anotherCategory, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, category_model_1.default.create({ name: "Beverages" })];
                case 1:
                    anotherCategory = _a.sent();
                    return [4 /*yield*/, subcategory_model_1.default.create({
                            category_id: parentCategory._id,
                            name: "Cheesecakes",
                        })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, subcategory_model_1.default.create({
                            category_id: anotherCategory._id,
                            name: "Hot Coffee",
                        })];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, (0, supertest_1.default)(app_1.default).get("/api/v1/subcategories?categoryId=".concat(parentCategory._id.toString()))];
                case 4:
                    res = _a.sent();
                    expect(res.status).toBe(200);
                    expect(res.body.message).toBe("Subcategories retrieved successfully");
                    expect(res.body.subcategories).toHaveLength(1);
                    expect(res.body.subcategories[0].name).toBe("Cheesecakes");
                    return [2 /*return*/];
            }
        });
    }); });
    it("should return 404 if filtering by a non-existent categoryId", function () { return __awaiter(void 0, void 0, void 0, function () {
        var nonExistentCategoryId, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    nonExistentCategoryId = "60a7e1f4b0d8a5001f8e1a1e";
                    return [4 /*yield*/, (0, supertest_1.default)(app_1.default).get("/api/v1/subcategories?categoryId=".concat(nonExistentCategoryId))];
                case 1:
                    res = _a.sent();
                    expect(res.status).toBe(404);
                    expect(res.body.message).toBe("Parent Category with ID '".concat(nonExistentCategoryId, "' not found."));
                    return [2 /*return*/];
            }
        });
    }); });
    // Test GET /api/v1/subcategories/:id
    it("should retrieve a subcategory by ID", function () { return __awaiter(void 0, void 0, void 0, function () {
        var newSubcategory, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, subcategory_model_1.default.create({
                        category_id: parentCategory._id,
                        name: "Cupcakes",
                        status: "available",
                    })];
                case 1:
                    newSubcategory = _a.sent();
                    return [4 /*yield*/, (0, supertest_1.default)(app_1.default).get("/api/v1/subcategories/".concat(newSubcategory._id.toString()))];
                case 2:
                    res = _a.sent();
                    expect(res.status).toBe(200);
                    expect(res.body.message).toBe("Subcategory retrieved successfully");
                    expect(res.body.subcategory.name).toBe("Cupcakes");
                    return [2 /*return*/];
            }
        });
    }); });
    it("should return 404 if subcategory ID is not found", function () { return __awaiter(void 0, void 0, void 0, function () {
        var nonExistentId, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    nonExistentId = "60a7e1f4b0d8a5001f8e1a1f";
                    return [4 /*yield*/, (0, supertest_1.default)(app_1.default).get("/api/v1/subcategories/".concat(nonExistentId))];
                case 1:
                    res = _a.sent();
                    expect(res.status).toBe(404);
                    expect(res.body.message).toBe("Subcategory with ID '".concat(nonExistentId, "' not found."));
                    return [2 /*return*/];
            }
        });
    }); });
    it("should return 400 for an invalid subcategory ID format", function () { return __awaiter(void 0, void 0, void 0, function () {
        var invalidId, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    invalidId = "invalid-sub-id";
                    return [4 /*yield*/, (0, supertest_1.default)(app_1.default).get("/api/v1/subcategories/".concat(invalidId))];
                case 1:
                    res = _a.sent();
                    expect(res.status).toBe(400);
                    expect(res.body.message).toContain("Invalid MongoDB ObjectId format");
                    return [2 /*return*/];
            }
        });
    }); });
    // Test PUT /api/v1/subcategories/:id
    it("should update a subcategory by ID", function () { return __awaiter(void 0, void 0, void 0, function () {
        var newSubcategory, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, subcategory_model_1.default.create({
                        category_id: parentCategory._id,
                        name: "Pastries",
                        status: "coming_soon",
                    })];
                case 1:
                    newSubcategory = _a.sent();
                    return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                            .put("/api/v1/subcategories/".concat(newSubcategory._id.toString()))
                            .send({ name: "Fresh Pastries", status: "available" })];
                case 2:
                    res = _a.sent();
                    expect(res.status).toBe(200);
                    expect(res.body.message).toBe("Subcategory updated successfully");
                    expect(res.body.subcategory.name).toBe("Fresh Pastries");
                    expect(res.body.subcategory.status).toBe("available");
                    return [2 /*return*/];
            }
        });
    }); });
    it("should return 404 if subcategory to update is not found", function () { return __awaiter(void 0, void 0, void 0, function () {
        var nonExistentId, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    nonExistentId = "60a7e1f4b0d8a5001f8e1a20";
                    return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                            .put("/api/v1/subcategories/".concat(nonExistentId))
                            .send({ name: "Non Existent Sub" })];
                case 1:
                    res = _a.sent();
                    expect(res.status).toBe(404);
                    expect(res.body.message).toBe("Subcategory with ID '".concat(nonExistentId, "' not found for update."));
                    return [2 /*return*/];
            }
        });
    }); });
    it("should return 409 if updating to a name that already exists in the same category", function () { return __awaiter(void 0, void 0, void 0, function () {
        var secondSubcategory, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, subcategory_model_1.default.create({
                        category_id: parentCategory._id,
                        name: "First Sub",
                        status: "available",
                    })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, subcategory_model_1.default.create({
                            category_id: parentCategory._id,
                            name: "Second Sub",
                            status: "available",
                        })];
                case 2:
                    secondSubcategory = _a.sent();
                    return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                            .put("/api/v1/subcategories/".concat(secondSubcategory._id.toString()))
                            .send({ name: "First Sub" })];
                case 3:
                    res = _a.sent();
                    expect(res.status).toBe(409);
                    expect(res.body.message).toContain("Subcategory with name 'First Sub' already exists in the target category.");
                    return [2 /*return*/];
            }
        });
    }); });
    it("should allow moving a subcategory to a different parent category", function () { return __awaiter(void 0, void 0, void 0, function () {
        var initialCategory, targetCategory, subcategoryToMove, res, oldParentSubcategories, newParentSubcategories;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, category_model_1.default.create({
                        name: "Desserts",
                        description: "Sweet treats",
                    })];
                case 1:
                    initialCategory = _a.sent();
                    return [4 /*yield*/, category_model_1.default.create({
                            name: "Breakfast Items",
                            description: "Morning delights",
                        })];
                case 2:
                    targetCategory = _a.sent();
                    return [4 /*yield*/, subcategory_model_1.default.create({
                            category_id: initialCategory._id,
                            name: "Pancakes",
                            status: "available",
                        })];
                case 3:
                    subcategoryToMove = _a.sent();
                    return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                            .put("/api/v1/subcategories/".concat(subcategoryToMove._id.toString()))
                            .send({ category_id: targetCategory._id.toString() })];
                case 4:
                    res = _a.sent();
                    expect(res.status).toBe(200);
                    expect(res.body.message).toBe("Subcategory updated successfully");
                    expect(res.body.subcategory.category_id).toBe(targetCategory._id.toString());
                    return [4 /*yield*/, subcategory_model_1.default.find({
                            category_id: initialCategory._id,
                        })];
                case 5:
                    oldParentSubcategories = _a.sent();
                    expect(oldParentSubcategories).toHaveLength(0);
                    return [4 /*yield*/, subcategory_model_1.default.find({
                            category_id: targetCategory._id,
                        })];
                case 6:
                    newParentSubcategories = _a.sent();
                    expect(newParentSubcategories).toHaveLength(1);
                    expect(newParentSubcategories[0].name).toBe("Pancakes");
                    return [2 /*return*/];
            }
        });
    }); });
    // Test DELETE /api/v1/subcategories/:id
    it("should delete a subcategory by ID", function () { return __awaiter(void 0, void 0, void 0, function () {
        var newSubcategory, res, foundSubcategory;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, subcategory_model_1.default.create({
                        category_id: parentCategory._id,
                        name: "Cookies",
                        status: "available",
                    })];
                case 1:
                    newSubcategory = _a.sent();
                    return [4 /*yield*/, (0, supertest_1.default)(app_1.default).delete("/api/v1/subcategories/".concat(newSubcategory._id.toString()))];
                case 2:
                    res = _a.sent();
                    expect(res.status).toBe(200);
                    expect(res.body.message).toBe("Subcategory deleted successfully");
                    expect(res.body.subcategory.name).toBe("Cookies");
                    return [4 /*yield*/, subcategory_model_1.default.findById(newSubcategory._id)];
                case 3:
                    foundSubcategory = _a.sent();
                    expect(foundSubcategory).toBeNull();
                    return [2 /*return*/];
            }
        });
    }); });
    it("should return 404 if subcategory to delete is not found", function () { return __awaiter(void 0, void 0, void 0, function () {
        var nonExistentId, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    nonExistentId = "60a7e1f4b0d8a5001f8e1a21";
                    return [4 /*yield*/, (0, supertest_1.default)(app_1.default).delete("/api/v1/subcategories/".concat(nonExistentId))];
                case 1:
                    res = _a.sent();
                    expect(res.status).toBe(404);
                    expect(res.body.message).toBe("Subcategory with ID '".concat(nonExistentId, "' not found for deletion."));
                    return [2 /*return*/];
            }
        });
    }); });
});

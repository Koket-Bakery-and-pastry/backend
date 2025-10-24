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
var app_1 = __importDefault(require("../../src/app")); // Import your Express app
var user_model_1 = __importDefault(require("../../src/database/models/user.model")); // Import the User model to assert database state
describe("User Registration API", function () {
    var registerEndpoint = "/api/v1/users/register";
    // Test case 1: Successful user registration
    it("should register a new user successfully with status 201", function () { return __awaiter(void 0, void 0, void 0, function () {
        var userData, res, userInDb;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    userData = {
                        name: "Test User",
                        email: "test@example.com",
                        password: "Password123!",
                    };
                    return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                            .post(registerEndpoint)
                            .send(userData)
                            .expect(201)];
                case 1:
                    res = _a.sent();
                    // Assert response body structure and content
                    expect(res.body).toHaveProperty("message", "User registered successfully");
                    expect(res.body.user).toHaveProperty("id");
                    expect(res.body.user).toHaveProperty("name", userData.name);
                    expect(res.body.user).toHaveProperty("email", userData.email);
                    expect(res.body.user).toHaveProperty("role", "customer");
                    expect(res.body.user).not.toHaveProperty("password_hash"); // Crucial: password hash should not be returned
                    return [4 /*yield*/, user_model_1.default.findById(res.body.user.id)];
                case 2:
                    userInDb = _a.sent();
                    expect(userInDb).not.toBeNull();
                    expect(userInDb === null || userInDb === void 0 ? void 0 : userInDb.email).toBe(userData.email);
                    expect(userInDb === null || userInDb === void 0 ? void 0 : userInDb.name).toBe(userData.name);
                    expect(userInDb === null || userInDb === void 0 ? void 0 : userInDb.password_hash).not.toBe(userData.password); // Password should be hashed
                    return [2 /*return*/];
            }
        });
    }); });
    // Test case 2: Attempt to register with an already existing email
    it("should return 409 Conflict if email already exists", function () { return __awaiter(void 0, void 0, void 0, function () {
        var userData, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    userData = {
                        name: "Existing User",
                        email: "existing@example.com",
                        password: "Password123!",
                    };
                    // First, register the user successfully
                    return [4 /*yield*/, (0, supertest_1.default)(app_1.default).post(registerEndpoint).send(userData).expect(201)];
                case 1:
                    // First, register the user successfully
                    _a.sent();
                    return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                            .post(registerEndpoint)
                            .send(userData)
                            .expect(409)];
                case 2:
                    res = _a.sent();
                    expect(res.body).toHaveProperty("message", "User with this email already exists.");
                    return [2 /*return*/];
            }
        });
    }); });
    // Test case 3: Invalid input - missing email
    it("should return 400 Bad Request for invalid input (missing email)", function () { return __awaiter(void 0, void 0, void 0, function () {
        var invalidUserData, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    invalidUserData = {
                        name: "Invalid User",
                        // email: missing
                        password: "Password123!",
                    };
                    return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                            .post(registerEndpoint)
                            .send(invalidUserData)
                            .expect(400)];
                case 1:
                    res = _a.sent();
                    expect(res.body).toHaveProperty("message");
                    expect(res.body.message).toContain("Invalid email address");
                    return [2 /*return*/];
            }
        });
    }); });
    // Test case 4: Invalid input - weak password
    it("should return 400 Bad Request for invalid input (weak password)", function () { return __awaiter(void 0, void 0, void 0, function () {
        var invalidUserData, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    invalidUserData = {
                        name: "Weak Password User",
                        email: "weakpass@example.com",
                        password: "pass", // Too short and not complex
                    };
                    return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                            .post(registerEndpoint)
                            .send(invalidUserData)
                            .expect(400)];
                case 1:
                    res = _a.sent();
                    expect(res.body).toHaveProperty("message");
                    expect(res.body.message).toContain("Password must be at least 8 characters long");
                    return [2 /*return*/];
            }
        });
    }); });
});

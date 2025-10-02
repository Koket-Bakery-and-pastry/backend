import request from "supertest";
import app from "../../src/app"; // Import your Express app
import User from "../../src/database/models/user.model"; // Import the User model to assert database state

describe("User Registration API", () => {
  const registerEndpoint = "/api/v1/users/register";

  // Test case 1: Successful user registration
  it("should register a new user successfully with status 201", async () => {
    const userData = {
      name: "Test User",
      email: "test@example.com",
      password: "Password123!",
    };

    const res = await request(app)
      .post(registerEndpoint)
      .send(userData)
      .expect(201);

    // Assert response body structure and content
    expect(res.body).toHaveProperty("message", "User registered successfully");
    expect(res.body.user).toHaveProperty("id");
    expect(res.body.user).toHaveProperty("name", userData.name);
    expect(res.body.user).toHaveProperty("email", userData.email);
    expect(res.body.user).toHaveProperty("role", "customer");
    expect(res.body.user).not.toHaveProperty("password_hash"); // Crucial: password hash should not be returned

    // Assert database state: check if user exists in the database
    const userInDb = await User.findById(res.body.user.id);
    expect(userInDb).not.toBeNull();
    expect(userInDb?.email).toBe(userData.email);
    expect(userInDb?.name).toBe(userData.name);
    expect(userInDb?.password_hash).not.toBe(userData.password); // Password should be hashed
  });

  // Test case 2: Attempt to register with an already existing email
  it("should return 409 Conflict if email already exists", async () => {
    const userData = {
      name: "Existing User",
      email: "existing@example.com",
      password: "Password123!",
    };

    // First, register the user successfully
    await request(app).post(registerEndpoint).send(userData).expect(201);

    // Second, attempt to register with the same email
    const res = await request(app)
      .post(registerEndpoint)
      .send(userData)
      .expect(409);

    expect(res.body).toHaveProperty(
      "message",
      "User with this email already exists."
    );
  });

  // Test case 3: Invalid input - missing email
  it("should return 400 Bad Request for invalid input (missing email)", async () => {
    const invalidUserData = {
      name: "Invalid User",
      // email: missing
      password: "Password123!",
    };

    const res = await request(app)
      .post(registerEndpoint)
      .send(invalidUserData)
      .expect(400); // Expect HTTP status 400 Bad Request

    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toContain("Invalid email address");
  });

  // Test case 4: Invalid input - weak password
  it("should return 400 Bad Request for invalid input (weak password)", async () => {
    const invalidUserData = {
      name: "Weak Password User",
      email: "weakpass@example.com",
      password: "pass", // Too short and not complex
    };

    const res = await request(app)
      .post(registerEndpoint)
      .send(invalidUserData)
      .expect(400);

    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toContain(
      "Password must be at least 8 characters long"
    );
  });
});

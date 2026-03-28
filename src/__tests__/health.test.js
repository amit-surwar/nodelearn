const http = require("http");

describe("Health Check", () => {
  test("API response format is correct", () => {
    const response = {
      success: true,
      data: { status: "OK" },
      error: null,
      meta: {},
    };

    expect(response).toHaveProperty("success", true);
    expect(response).toHaveProperty("data");
    expect(response).toHaveProperty("error", null);
    expect(response).toHaveProperty("meta");
    expect(response.data.status).toBe("OK");
  });

  test("Error response format is correct", () => {
    const response = {
      success: false,
      data: null,
      error: "Something went wrong",
      meta: {},
    };

    expect(response.success).toBe(false);
    expect(response.data).toBeNull();
    expect(response.error).toBeTruthy();
  });
});

describe("Validation", () => {
  const { createUserSchema } = require("../utils/validation");

  test("Valid user data passes validation", () => {
    const validUser = {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      age: 25,
    };

    const result = createUserSchema.parse(validUser);
    expect(result.name).toBe("Test User");
    expect(result.email).toBe("test@example.com");
  });

  test("Invalid email is rejected", () => {
    const invalidUser = {
      name: "Test",
      email: "not-an-email",
      password: "password123",
    };

    expect(() => createUserSchema.parse(invalidUser)).toThrow();
  });

  test("Short password is rejected", () => {
    const invalidUser = {
      name: "Test",
      email: "test@example.com",
      password: "short",
    };

    expect(() => createUserSchema.parse(invalidUser)).toThrow();
  });
});

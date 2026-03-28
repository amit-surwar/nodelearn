const { z } = require("zod");

// =====================================================
// BUG #1 is somewhere in this file
// Hint: One validation schema is too loose — it allows
// bad data through. Check what "age" accepts...
// =====================================================

const createUserSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format"),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters"),
  age: z.number().int().min(13).max(120).optional(),
  role: z.enum(["user", "admin"]).optional(),
});

const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters")
    .optional(),
  email: z.string().email("Invalid email format").optional(),
  age: z.number().int().min(13).max(120).optional(),
  role: z.enum(["user", "admin"]).optional(),
});

module.exports = { createUserSchema, updateUserSchema };

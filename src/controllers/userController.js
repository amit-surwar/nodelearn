const userService = require("../services/userService");
const { sendSuccess, sendError } = require("../utils/response");
const { createUserSchema, updateUserSchema } = require("../utils/validation");

const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    return sendSuccess(res, users, { count: users.length });
  } catch (error) {
    return sendError(res, "Failed to fetch users", 500);
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return sendSuccess(res, user);
  } catch (error) {
    if (error.statusCode === 404) {
      return sendError(res, error.message, 404);
    }
    return sendError(res, "Failed to fetch user", 500);
  }
};

const createUser = async (req, res) => {
  try {
    const parsed = createUserSchema.parse(req.body);
    const user = await userService.createUser(parsed);
    return sendSuccess(res, user, {}, 201);
  } catch (error) {
    if (error.name === "ZodError") {
      const messages = error.errors.map((e) => e.message);
      return sendError(res, messages, 400);
    }
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    return sendError(res, "Failed to create user", 500);
  }
};

const updateUser = async (req, res) => {
  try {
    const parsed = updateUserSchema.parse(req.body);
    const user = await userService.updateUser(req.params.id, parsed);
    return sendSuccess(res, user);
  } catch (error) {
    if (error.name === "ZodError") {
      const messages = error.errors.map((e) => e.message);
      return sendError(res, messages, 400);
    }
    if (error.statusCode === 404) {
      return sendError(res, error.message, 404);
    }
    return sendError(res, "Failed to update user", 500);
  }
};

const deleteUser = async (req, res) => {
  try {
    const result = await userService.deleteUser(req.params.id);
    return sendSuccess(res, result);
  } catch (error) {
    if (error.statusCode === 404) {
      return sendError(res, error.message, 404);
    }
    return sendError(res, "Failed to delete user", 500);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};

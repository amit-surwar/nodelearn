const bcrypt = require("bcryptjs");
const userRepository = require("../repositories/userRepository");
const { AppError } = require("../utils/AppError");

const getAllUsers = async () => {
  const users = await userRepository.findAllUsers();
  return users;
};

const getUserById = async (id) => {
  const user = await userRepository.findUserById(id);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
};

const createUser = async (userData) => {
  const existingUser = await userRepository.findUserByEmail(userData.email);
  if (existingUser) {
    throw new AppError("Email already registered", 409);
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);

  const user = await userRepository.createUser({
    ...userData,
    password: hashedPassword,
  });

  return user;
};

const updateUser = async (id, updateData) => {
  const existingUser = await userRepository.findUserById(id);
  if (!existingUser) {
    throw new AppError("User not found", 404);
  }

  const updatedUser = await userRepository.updateUser(id, updateData);
  return updatedUser;
};

const deleteUser = async (id) => {
  const existingUser = await userRepository.findUserById(id);
  if (!existingUser) {
    throw new AppError("User not found", 404);
  }

  await userRepository.deleteUser(id);
  return { message: "User soft deleted successfully" };
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};

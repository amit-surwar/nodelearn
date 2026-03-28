const { User } = require("../models/User");

const findAllUsers = async () => {
  const users = await User.find({ deleted_at: null }).select("-password");
  return users;
};

const findUserById = async (id) => {
  const user = await User.findById(id).select("-password");
  return user;
};

const findUserByEmail = async (email) => {
  const user = await User.findOne({ email, deleted_at: null });
  return user;
};

const createUser = async (userData) => {
  const user = new User(userData);
  await user.save();
  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
};

const updateUser = async (id, updateData) => {
  const user = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).select("-password");
  return user;
};

const deleteUser = async (id) => {
  const user = await User.findByIdAndUpdate(
    id,
    { deleted_at: new Date(), is_active: false },
    { new: true }
  ).select("-password");
  return user;
};

module.exports = {
  findAllUsers,
  findUserById,
  findUserByEmail,
  createUser,
  updateUser,
  deleteUser,
};

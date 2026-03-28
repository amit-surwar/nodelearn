const express = require("express");
const userController = require("../controllers/userController");

const router = express.Router();

// =====================================================
// BUG #10 is here
// Hint: One of these routes uses the wrong HTTP method.
// Think about what REST convention says about each
// operation. Is GET the right method for creating?
// =====================================================

router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.post("/", userController.createUser);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

module.exports = router;

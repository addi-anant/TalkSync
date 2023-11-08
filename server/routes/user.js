const router = require("express").Router();
const user_controller = require("../controllers/user");
const { protect } = require("../middleware/authMiddleware");

/* Login: */
router.post("/login", user_controller.login);

/* Register: */
router.post("/register", user_controller.register);

/* Get All User: */
router.get("/get-all-user", protect, user_controller.getAllUsers);
module.exports = router;

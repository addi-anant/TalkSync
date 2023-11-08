const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const message_controller = require("../controllers/message");

/* Send Message: */
router.post("/send", protect, message_controller.sendMessage);

/* Fetch All Messages: */
router.get("/fetch-all/:chatID", protect, message_controller.fetchAllMessages);

module.exports = router;

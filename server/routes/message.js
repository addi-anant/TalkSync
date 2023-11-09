const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const message_controller = require("../controllers/message");

/* Send Message: */
router.post("/send", protect, message_controller.sendMessage);

/* Fetch Messages: */
router.get("/fetch/:chatID", protect, message_controller.fetchMessages);

/* Fetch Messages By Range: */
router.get(
  "/fetch-by-range/:chatID/:pageNo",
  protect,
  message_controller.fetchMessagesByRange
);

module.exports = router;

const router = require("express").Router();
const chat_router = require("../controllers/chat");
const { protect } = require("../middleware/authMiddleware");

/* Fetch Chat: (Logged In Account) */
router.get("/", protect, chat_router?.fetchChat);

/* Access Chat: (Create/Fetch 1-1 Chat) */
router.post("/", protect, chat_router?.accessChat);

/* Create Group Chat: */
router.post("/group", protect, chat_router?.createGroupChat);

/* Rename Group: */
router.put("/rename", protect, chat_router?.renameGroup);

/* Add to Group */
router.put("/add-to-group", protect, chat_router?.addToGroup);

/* Remove From Group: */
router.put("/remove-from-group", protect, chat_router?.removeFromGroup);

module.exports = router;

const router = require("express").Router();

/* user route: */
router.use("/user", require("./user"));

/* chat route: */
router.use("/chat", require("./chat"));

/* message route: */
router.use("/message", require("./message"));

module.exports = router;

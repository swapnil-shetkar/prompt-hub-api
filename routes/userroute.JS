const express = require("express");
const router = express.Router();
const { authenticateToken, isAuth, isAdmin } = require("../controllers/authcontroller");
const { userById, read, update, purchaseHistory } = require("../controllers/usercontroller");

router.get("/secret/:userId", authenticateToken, isAuth, isAdmin, (req, res) => {
    res.json({
        user: req.profile
    });
});
router.get("/profile/:userId", authenticateToken, isAuth, read);
router.put("/profile/:userId", authenticateToken, isAuth, update);
router.get("/orders/by/user/:userId", authenticateToken, isAuth, purchaseHistory);

router.param("userId", userById);

module.exports = router;

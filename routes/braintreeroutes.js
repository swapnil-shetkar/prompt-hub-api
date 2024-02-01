const express = require("express");
const router = express.Router();

const { authenticateToken, isAuth } = require("../controllers/authcontroller");
const { userById } = require("../controllers/usercontroller");
const { generateToken, processPayment } = require("../controllers/braintreecontroller");

router.get("/getToken/:userId", authenticateToken, isAuth, generateToken);
router.post(
    "/payment/:userId",
    authenticateToken,
    isAuth,
    processPayment
);

router.param("userId", userById);

module.exports = router;

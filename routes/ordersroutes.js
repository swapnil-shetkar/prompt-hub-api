const express = require("express");
const router = express.Router();

const { authenticateToken, isAuth, isAdmin } = require("../controllers/authcontroller");
const { userById, addOrderToUserHistory } = require("../controllers/usercontroller");
const {
    create,
    listOrders,
    getStatusValues,
    orderById,
    updateOrderStatus
} = require("../controllers/ordercontroller");
// const { decreaseQuantity } = require("../controllers/productController");

router.post(
    "/create/:userId",
    authenticateToken,
    isAuth,
    addOrderToUserHistory,
    // decreaseQuantity,
    create
);

router.get("/list/:userId", authenticateToken, isAuth, isAdmin, listOrders);
router.get(
    "/status-values/:userId",
    authenticateToken,
    isAuth,
    isAdmin,
    getStatusValues
);
router.put(
    "/:orderId/status/:userId",
    authenticateToken,
    isAuth,
    isAdmin,
    updateOrderStatus
);

router.param("userId", userById);
router.param("orderId", orderById);

module.exports = router;

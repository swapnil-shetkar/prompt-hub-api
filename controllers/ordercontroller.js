const { Order, CartItem } = require("../models/order");
const { errorHandler } = require("../helpers/dberrorhandler");

exports.orderById = (req, res, next, id) => {
    Order.findById(id)
        .populate("products.product", "name price")
        .exec()
        .then(order => {
            if (!order) {
                return res.status(404).json({
                    error: 'Order not found',
                });
            }
            req.order = order;
            next();
        })
        .catch(error => {
            res.status(400).json({
                error: errorHandler(error),
            });
        });
};


exports.create = async (req, res) => {
    // console.log("CREATE ORDER: ", req.body);
    req.body.order.user = req.profile;
    const order = new Order(req.body.order);

    try {
        const data = await order.save();
        res.json(data);
    } catch (error) {
        res.status(400).json({
            error: errorHandler(error)
        });
    }
};

exports.listOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("user", "_id name address")
            .sort("-created")
            .exec();

        res.json(orders);
    } catch (error) {
        res.status(400).json({
            error: errorHandler(error)
        });
    }
};


exports.getStatusValues = (req, res) => {
    res.json(Order.schema.path("status").enumValues);
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const result = await Order.updateOne(
            { _id: req.body.orderId },
            { $set: { status: req.body.status } }
        );

        if (result.nModified === 0) {
            return res.status(400).json({
                error: "Could not update order status"
            });
        }

        res.json(result);
    } catch (error) {
        res.status(400).json({
            error: errorHandler(error)
        });
    }
};


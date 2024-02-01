const { errorHandler } = require("../helpers/dberrorhandler");
const User = require("../models/user");
const { Order, CartItem } = require("../models/order");

exports.userById = (req, res, next, id) => {
    User.findById(id)
        .then(user => {
            if (!user) {
                return res.status(400).json({
                    error: "User not found"
                });
            }
            req.profile = user;
            next();
        })
        .catch(err => {
            return res.status(400).json({
                error: "User not found"
            });
        });
};

exports.read = (req, res) => {
    req.profile.hashed_password = undefined;
    return res.json(req.profile);
};

exports.update = async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { _id: req.profile._id },
            { $set: req.body },
            { new: true }
        );

        if (!user) {
            return res.status(400).json({
                error: "You are not authorized to perform this action"
            });
        }

        // Clear the hashed password before sending the response
        user.hashed_password = undefined;
        res.json(user);
    } catch (err) {
        return res.status(500).json({
            error: "Internal server error"
        });
    }
};

exports.addOrderToUserHistory = async (req, res, next) => {
    try {
        let history = [];

        req.body.order.products.forEach(item => {
            history.push({
                _id: item._id,
                name: item.name,
                description: item.description,
                category: item.category,
                quantity: item.count,
                transaction_id: req.body.order.transaction_id,
                amount: req.body.order.amount
            });
        });

        const updatedUser = await User.findOneAndUpdate(
            { _id: req.profile._id },
            { $push: { history: history } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(400).json({
                error: "Could not update user purchase history"
            });
        }

        next();
    } catch (error) {
        res.status(400).json({
            error: "Could not update user purchase history"
        });
    }
};

exports.purchaseHistory = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.profile._id })
            .populate("user", "_id name")
            .sort("-created")
            .exec();

        res.json(orders);
    } catch (error) {
        res.status(400).json({
            error: error.message || "Error fetching purchase history"
        });
    }
};



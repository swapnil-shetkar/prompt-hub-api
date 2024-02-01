const Category = require("../models/category");
const { errorHandler } = require("../helpers/dberrorhandler");

exports.create = async (req, res) => {
  try {
    const category = new Category(req.body);
    const data = await category.save();
    res.json({ data });
  } catch (err) {
    return res.status(400).json({
      error: errorHandler(err),
    });
  }
};

exports.categoryId = async (req, res, next, id) => {
  Category.findById(id)
    .then((category) => {
      if (!category) {
        return res.status(400).json({
          error: "Category not found",
        });
      }
      req.category = category;
      next();
    })
    .catch((err) => {
      return res.status(400).json({
        error: "category doesnot exist.",
      });
    });
};

exports.read = (req, res) => {
  return res.json(req.category);
};

exports.update = async (req, res) => {
  try {
    const category = req.category;

    if (!req.body.name) {
      return res.status(400).json({
        success: false,
        message: "Name is required for updating category",
      });
    }
    category.name = req.body.name;

    const updatedCategory = await category.save();

    res.json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.remove = (req, res) => {
  let category = req.category;
  category
    .deleteOne()
    .then((result) => {
      if (result.deletedCount === 0) {
        return res.status(404).json({
          error: "Category not found",
        });
      }

      res.json({
        message: "Category deleted successfully",
      });
    })
    .catch((err) => {
      return res.status(400).json({
        error: errorHandler(err),
      });
    });
};

exports.list = async (req, res) => {
  try {
    const data = await Category.find().exec();
    res.json(data);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler(err),
    });
  }
};

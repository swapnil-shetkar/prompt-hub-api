const Product = require("../models/product"); // Adjust the path accordingly
const { uploadFile } = require("../helpers/cloudinary"); // Adjust the path accordingly

exports.productById = async (req, res, next, id) => {
  try {
    const product = await Product.findById(id).populate("category").exec();

    if (!product) {
      return res.status(400).json({
        error: "Product not found",
      });
    }

    req.product = product;
    next();
  } catch (err) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

exports.read = (req, res) => {
  return res.json(req.product);
};

exports.remove = (req, res) => {
  let product = req.product;
  product
    .deleteOne()
    .then((result) => {
      if (result.deletedCount === 0) {
        return res.status(404).json({
          error: "Product not found",
        });
      }

      res.json({
        message: "Product deleted successfully",
      });
    })
    .catch((err) => {
      return res.status(400).json({
        error: errorHandler(err),
      });
    });
};

exports.create = async (req, res) => {
  try {
    // Destructure data from the request body
    const { name, description, price, category, shipping, quantity } = req.body;

    // Check for null or undefined values in required fields
    if (
      !name ||
      !description ||
      !price ||
      !category ||
      shipping == null ||
      quantity == null
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Initialize photoData to null
    let photoData = null;

    // Check if a file is provided
    if (req.file && req.file.path) {
      // Assuming the photo data is stored as a file path in req.file.path
      photoData = req.file.path;
    }

    // Upload the file to Cloudinary and get the result if a file is provided
    let cloudinaryResult = null;
    if (photoData) {
      cloudinaryResult = await uploadFile(photoData);

      // Check for null or undefined result
      if (!cloudinaryResult) {
        return res.status(500).json({
          success: false,
          message: "Error uploading file to Cloudinary",
        });
      }
    }

    // Create a new product instance
    const product = new Product({
      name,
      description,
      price,
      category,
      shipping,
      quantity,
      // Set the photo data and content type only if a file is provided
      photo: photoData
        ? {
            data: cloudinaryResult.secure_url,
            contentType: cloudinaryResult.format,
          }
        : null,
    });

    // Save the product to the database
    const savedProduct = await product.save();

    res.json({
      success: true,
      message: "Product created successfully",
      data: savedProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.update = async (req, res) => {
  try {
    const product = req.product;
    const { name, description, price, category, shipping, quantity } = req.body;

    // Check if a file is provided
    if (req.file && req.file.path) {
      const photoData = req.file.path;

      const cloudinaryResult = await uploadFile(photoData);

      if (!cloudinaryResult) {
        return res.status(500).json({
          success: false,
          message: "Error uploading file to Cloudinary",
        });
      }

      // Update the product's photo data and content type
      product.photo = {
        data: cloudinaryResult.secure_url,
        contentType: cloudinaryResult.format,
      };

      // Save the updated product to the database
      const updatedProduct = await product.save();

      return res.json({
        success: true,
        message: "Product photo updated successfully",
        data: updatedProduct,
      });
    }

    // Check if at least one other field is provided for updating
    if (![name, description, price, category, shipping, quantity].some(field => field !== undefined)) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required for update (excluding file)",
      });
    }

    // Update the product properties if the fields are provided
    Object.assign(product, {
      name: name || product.name,
      description: description || product.description,
      price: price || product.price,
      category: category || product.category,
      shipping: shipping !== undefined ? shipping : product.shipping,
      quantity: quantity !== undefined ? quantity : product.quantity,
    });

    // Save the updated product to the database
    const updatedProduct = await product.save();

    res.json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};



exports.list = async (req, res) => {
  try {
      let order = req.query.order ? req.query.order : "asc";
      let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
      let limit = req.query.limit ? parseInt(req.query.limit) : 6;

      const products = await Product.find()
          .populate("category")
          .sort([[sortBy, order]])
          .limit(limit)
          .exec();

      res.json(products);
  } catch (err) {
      return res.status(400).json({
          error: "Products not found",
      });
  }
};

exports.listRelated = async (req, res) => {
  try {
      let limit = req.query.limit ? parseInt(req.query.limit) : 6;

      const products = await Product.find({ _id: { $ne: req.product },category: req.product.category})
          .populate("category", "_id name")
          .limit(limit)
          .exec();

      res.json(products);
  } catch (err) {
      return res.status(400).json({
          error: "Products not found",
      });
  }
};

exports.listCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category");

    if (!categories || categories.length === 0) {
      return res.status(404).json({
        error: "Categories not found",
      });
    }

    res.json(categories);
  } catch (err) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

exports.listBySearch = async (req, res) => {
  try {
    let order = req.body.order ? req.body.order : "desc";
    let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
    let limit = req.body.limit ? parseInt(req.body.limit) : 100;
    let skip = parseInt(req.body.skip);
    let findArgs = {};

    for (let key in req.body.filters) {
      if (req.body.filters[key].length > 0) {
        if (key === "price") {
          findArgs[key] = {
            $gte: req.body.filters[key][0],
            $lte: req.body.filters[key][1],
          };
        } else {
          findArgs[key] = req.body.filters[key];
        }
      }
    }

    const data = await Product.find(findArgs)
      .populate("category")
      .sort([[sortBy, order]])
      .skip(skip)
      .limit(limit)
      .exec();

    res.json({
      size: data.length,
      data,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

exports.listSearch = async (req, res) => {
  try {
    // Create query object to hold search value and category value
    const query = {};

    // Assign search value to query.name
    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: "i" };

      // Assign category value to query.category
      if (req.query.category && req.query.category !== "All") {
        query.category = req.query.category;
      }

      // Find the product based on the query object with 2 properties: search and category
      const products = await Product.find(query).populate("category").exec();

      res.json(products);
    } else {
      // If no search query is provided, return all products
      const products = await Product.find().populate("category").exec();

      res.json(products);
    }
  } catch (err) {
    return res.status(400).json({
      error: errorHandler(err),
    });
  }
};

// exports.decreaseQuantity = async (req, res, next) => {
//   try {
//       const bulkOps = req.body.order.products.map(item => ({
//           updateOne: {
//               filter: { _id: item._id },
//               update: { $inc: { quantity: -item.count, sold: +item.count } },
//           },
//       }));

//       const result = await Product.bulkWrite(bulkOps, {});

//       if (result && result.nModified !== bulkOps.length) {
//           return res.status(400).json({
//               error: "Could not update product",
//           });
//       }

//       next();
//   } catch (error) {
//       res.status(400).json({
//           error: "Could not update product",
//       });
//   }
// };

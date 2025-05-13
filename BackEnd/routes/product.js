const express = require("express");
const router = express.Router();
const Product = require("../models/Products");
const { body, validationResult } = require("express-validator");
const fetchuser = require("../middleware/fetchuser");

// Route 1 Adding product using POST . /api/product/uploads login is required ...

router.post(
  "/uploads",
  fetchuser,
  //  Adding a validation
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("brand").notEmpty().withMessage("Brand name is required"),
    body("price").notEmpty().withMessage("price is required"),
    body("image").notEmpty().withMessage("image is required"),
    body("category").notEmpty().withMessage("category is required"),
    body("description").notEmpty().withMessage("description is required"),
  ],
  async (req, res) => {
    // console.log(req.body)
    // Check if there is an error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      // Saving a User in the database
      let product = {
        name: req.body.name,
        brand: req.body.brand,
        price: req.body.price,
        image: req.body.image,
        category: req.body.category,
        description: req.body.description,
      };

      product = new Product(product);
      // Save the product to the database
      product = await product.save();
      // If the product is saved successfully, send a response with the product data
      res.status(200).json(product);
      // res.status(200).json({msg:"Ok"});
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error");
    }
  }
);

// Route 2 Get all products using GET . /api/product/allproducts No login required ...
router.get("/allproducts", async (req, res) => {
  try {
    // Fetch all products from the database
    const products = await Product.find();
    // If the products are fetched successfully, send a response with the product data
    res.status(200).json(products);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

// Route 3 Get mens products using GET . /api/product/mens No login required ...
router.get("/mens", async (req, res) => {
  try {
    // Fetch all products from the database
    const products = await Product.find({ category: "male" });
    // If the products are fetched successfully, send a response with the product data
    res.status(200).json(products);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

// Route 3 Get womens products using GET . /api/product/womens No login required ...
router.get("/womens", async (req, res) => {
  try {
    // Fetch all products from the database
    const products = await Product.find({ category: "female" });
    // If the products are fetched successfully, send a response with the product data
    res.status(200).json(products);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

// Route 4 Get kids products using GET . /api/product/kids No login required ...
router.get("/kids", async (req, res) => {
  try {
    // Fetch all products from the database
    const products = await Product.find({ category: "kids" });
    // If the products are fetched successfully, send a response with the product data
    res.status(200).json(products);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

// Route 5 Get single products using GET . /api/product/item/:id No login required ...
router.get("/item/:id", async (req, res) => {
  try {
    // Fetch all products from the database
    let products = await Product.findById(req.params.id);
    if (!products) {
      return res.status(404).json({ message: "Something in wrong" });
    }
    // If the products are fetched successfully, send a response with the product data
    res.status(200).json(products);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

// Route 5 Delete single products using delete . /api/product/item/:id  login required ...

router.delete("/item/:id", fetchuser, async (req, res) => {
  try {
    // Fetch all products from the database
    // Find the product by ID and delete it
    // The findByIdAndDelete method searches for a product with the specified ID in the database and deletes it
    let products = await Product.findByIdAndDelete(req.params.id);
    if (!products) {
      return res.status(404).json({ message: "Something in wrong" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;

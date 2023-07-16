const express = require("express");
const router = express.Router();

const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  password: "secret",
  database: "ecommerce",
  port: 5432,
});

router.post("/", async (req, res) => {
  try {
    const { name, price, stock } = req.body;
    const query =
      "INSERT INTO products (name, price, stock) VALUES ($1, $2, $3)";
    await pool.query(query, [name, price, stock]);

    res.status(201).json({
      code: 201,
      status: "success",
      message: "product created successfully",
      data: {
        name,
      },
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      status: "error",
      message: "error creating product",
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const query = "SELECT * FROM products";
    const { rows } = await pool.query(query);
    res.status(200).json({
      code: 200,
      status: "success",
      message: "products retrieved successfully",
      data: {
        products: rows,
      },
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      status: "error",
      message: "error retrieving products",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const query = "SELECT * FROM products WHERE id = $1";
    const { rows } = await pool.query(query, [id]);
    res.status(200).json({
      code: 200,
      status: "success",
      message: "product retrieved successfully",
      data: {
        product: rows,
      },
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      status: "error",
      message: "error retrieving product",
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, stock } = req.body;
    const query =
      "UPDATE products SET name = $1, price = $2, stock = $3 WHERE id = $4";
    await pool.query(query, [name, price, stock, id]);

    res.status(200).json({
      code: 200,
      status: "success",
      message: "product updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      status: "error",
      message: "error updating product",
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const query = "DELETE FROM products WHERE id = $1";
    await pool.query(query, [id]);

    res.status(200).json({
      code: 200,
      status: "success",
      message: "product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      status: "error",
      message: "error deleting product",
    });
  }
});

module.exports = router;

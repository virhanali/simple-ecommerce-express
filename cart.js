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
    const { user_id, product_id, quantity } = req.body;

    const productQuery = "SELECT * FROM products WHERE id = $1";
    const productResult = await pool.query(productQuery, [product_id]);
    const product = productResult.rows[0];

    if (!product) {
      return res.status(404).json({
        code: 404,
        status: "error",
        message: "product not found",
      });
    }

    const { price } = product;
    const total_items = quantity;

    const cartQuery =
      "INSERT INTO carts (user_id, total_items) VALUES ($1, $2) RETURNING id";
    const cartResult = await pool.query(cartQuery, [user_id, total_items]);
    const cartId = cartResult.rows[0].id;

    const subtotal = price * quantity;

    const itemQuery =
      "INSERT INTO cart_items (cart_id, product_id, quantity, subtotal) VALUES ($1, $2, $3, $4)";
    await pool.query(itemQuery, [cartId, product_id, quantity, subtotal]);

    res.status(201).json({
      code: 201,
      status: "success",
      message: "product added to cart successfully",
    });
  } catch (error) {
    console.error("Error adding product to cart:", error);
    res.status(500).json({
      code: 500,
      status: "error",
      message: "error adding product to cart",
    });
  }
});

router.get("/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const query = `
      SELECT ci.id AS item_id, p.id AS product_id, p.name, p.price, ci.quantity, ci.subtotal
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      JOIN carts c ON c.id = ci.cart_id
      WHERE c.user_id = $1
    `;
    const { rows } = await pool.query(query, [user_id]);

    res.status(200).json({
      code: 200,
      status: "success",
      message: "user's cart retrieved successfully",
      data: {
        cart: rows,
      },
    });
  } catch (error) {
    console.error("Error retrieving user's cart:", error);
    res.status(500).json({
      code: 500,
      status: "error",
      message: "error retrieving user's cart",
    });
  }
});

router.delete("/:cartId/items/:itemId", async (req, res) => {
  try {
    const { cartId, itemId } = req.params;

    const itemQuery =
      "SELECT subtotal, quantity FROM cart_items WHERE cart_id = $1 AND id = $2";
    const itemResult = await pool.query(itemQuery, [cartId, itemId]);
    const item = itemResult.rows[0];

    if (!item) {
      return res.status(404).json({
        code: 404,
        status: "error",
        message: "item not found in cart",
      });
    }

    const { subtotal, quantity } = item;

    const deleteQuery = "DELETE FROM cart_items WHERE cart_id = $1 AND id = $2";
    await pool.query(deleteQuery, [cartId, itemId]);

    const updateCartQuery =
      "UPDATE carts SET total_items = total_items - $1 WHERE id = $2";
    await pool.query(updateCartQuery, [quantity, cartId]);

    res.status(200).json({
      code: 200,
      status: "success",
      message: "product removed from cart successfully",
    });
  } catch (error) {
    console.error("Error removing product from cart:", error);
    res.status(500).json({
      code: 500,
      status: "error",
      message: "error removing product from cart",
    });
  }
});

module.exports = router;

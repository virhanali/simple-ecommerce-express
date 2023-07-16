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
// create user
router.post("/", async (req, res) => {
  try {
    const { name, email } = req.body;
    const query = "INSERT INTO users (name, email) VALUES ($1, $2)";
    await pool.query(query, [name, email]);

    res.status(201).json({
      code: 201,
      status: "success",
      message: "user created successfully",
    });
  } catch (error) {
    if (error.code === "23505" && error.constraint === "unique_email") {
      res.status(409).json({
        code: 409,
        status: "error",
        message: "email already exists",
      });
    } else {
      console.error("Error creating user:", error);
      res.status(500).json({
        code: 500,
        status: "error",
        message: "error creating user",
      });
    }
  }
});

// get all users
router.get("/", async (req, res) => {
  try {
    const query = "SELECT * FROM users";
    const { rows } = await pool.query(query);
    res.status(200).json({
      code: 200,
      status: "success",
      message: "users retrieved successfully",
      data: {
        users: rows,
      },
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      status: "error",
      message: "error retrieving users",
    });
  }
});
// get user by id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const query = "SELECT * FROM users WHERE id = $1";
    const { rows } = await pool.query(query, [id]);
    res.status(200).json({
      code: 200,
      status: "success",
      message: "user retrieved successfully",
      data: {
        user: rows,
      },
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      status: "error",
      message: "error retrieving user",
    });
  }
});

module.exports = router;

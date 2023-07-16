const express = require("express");
const app = express();

const usersRouter = require("./users");
const productsRouter = require("./products");
const cartRouter = require("./cart");

app.use(express.json());

app.use("/users", usersRouter);
app.use("/product", productsRouter);
app.use("/cart", cartRouter);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
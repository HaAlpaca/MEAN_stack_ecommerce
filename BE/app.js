const express = require("express");
const app = express();
const bodyParser = require("body-parser"); // receive body of the request
const morgan = require("morgan"); // receive api method and show in terminal
const mongoose = require("mongoose");
const cors = require('cors')
require("dotenv/config"); // env config
const api = process.env.API_URL; // URL
const authJwt = require("./helpers/jwt");
const errorHandler = require('./helpers/error-handler')

const productsRouter = require("./routes/products");
const categoriesRouter = require("./routes/categories");
const usersRouter = require("./routes/users");

app.use(cors())
app.options('*',cors())

// middleware
app.use(bodyParser.json());
app.use(morgan("tiny")); // log http method
app.use(authJwt()) // Protecting the API and Authentication JWT Middleware
app.use(errorHandler) // error handler 

// router FETCH API
app.use(`${api}/products`, productsRouter);
app.use(`${api}/categories`, categoriesRouter);
app.use(`${api}/users`,usersRouter)

mongoose
  .connect(process.env.CONNECTION_STRING)
  .then(() => {
    console.log("Database connection is ready...");
  })
  .catch((err) => {
    console.log(err);
  });

// start server
app.listen(1407, () => {
  console.log(api);
  console.log("server is running in http://localhost:1407");
});

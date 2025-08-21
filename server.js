const express = require("express");
const app = express();
const db = require("./db");
require("dotenv").config();
const bodyParser = require("body-parser");
app.use(bodyParser.json());
const PORT = process.env.PORT || 3000;

//User DETAIL
const userRoutes = require("./routes/userRoutes");
app.use("/user", userRoutes);
// Middleware for JWT authentication

//Candidate DETAIL
const candidateRoute = require("./routes/candidateRoute");
app.use("/candidate", candidateRoute);

app.listen(PORT, () => {
  console.log("Listening on port 3000");
});

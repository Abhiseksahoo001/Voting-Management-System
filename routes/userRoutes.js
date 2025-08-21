const express = require("express");
const router = express.Router();
const User = require("../models/user");
// const passport = require("../OAuth");
const { jwtAuthMiddleware, generateToken } = require("../jwt");

//Post route to add a user
router.post("/signup", async (req, res) => {
  try {
    const UserData = req.body;
    const newUser = new User(UserData);
    const saveData = await newUser.save();
    console.log("data saved");
    // Generate JWT token after successful signup
    const payload = {
      id: saveData._id,
    };
    console.log("Payload for token:", payload);
    const token = generateToken(payload); // Generate JWT token
    console.log("Token generated is:", token);

    res.status(200).json({ saveData: saveData, token: token }); // Send the token back to the client
  } catch (err) {
    console.error("Signup error:", err); // log full error stack
    res.status(400).json({ error: err.message }); // send actual error back
  }
});
//LOGIN ROUTE //IF the user is already registered and token is expaired
// this route will be used to login the user and generate a new token
router.post("/login", async (req, res, next) => {
  // Use passport to authenticate the user
  try {
    //extract username and password from request body
    const { addharCardNumber, password } = req.body;
    // find the user by username
    const user = await User.findOne({ addharCardNumber: addharCardNumber });
    //if user and password are not found, return an error
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid username or password" });
    } // If user is found and password matches, proceed to generate token
    const payload = { id: user._id };
    const token = generateToken(payload); // Generate JWT token
    // return the token to the client
    console.log("Token generated for login:", token);
    res.status(200).json({ message: "Login successful", token: token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error during login" });
  }
});

// give data to the client viya get method

router.get(
  "/profile",
  jwtAuthMiddleware, // ✅ verifies token & puts decoded payload into req.user
  async (req, res) => {
    try {
      // ✅ Correct: use findById with the ID from token payload
      const data = await User.findById(req.user.id);

      if (!data) {
        return res.status(404).json({ message: "Person not found" });
      }

      console.log("Data fetched successfully");
      res.status(200).json(data); // ✅ returns the logged-in person's data
    } catch (err) {
      console.log("Error fetching data:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

//UPDATE OPERATION

router.put("/profile/password", jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user; //Extract the id from the token
    const { currentPassword, newPassword } = req.body; //Get the current and new password from the request body
    const user = await User.findById(userId.id); // Find the user by ID from the token
    if (!user || !(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    // If user is found and password matches, proceed to update password
    user.password = newPassword; // Update the password
    await user.save(); // Save the updated user document
    console.log("Data Updated Successfully");
    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal Server Error" });
  }
});

module.exports = router;

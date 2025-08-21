const mongoose = require("mongoose");
const { type } = require("os");
// Define the schema for a person
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
  },
  mobile: {
    type: String,
  },
  address: {
    type: String,
  },
  addharCardNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["voter", "admin"],
    default: "voter",
  },
  isVoted: {
    type: Boolean,
    default: false,
  },
});
userSchema.pre("save", async function (next) {
  const person = this;
  // Hash the password if it has been modified (or is new)
  if (!person.isModified("password")) return next();
  try {
    // hash  password generation
    const salt = await bcrypt.genSalt(10);

    //hash password generation
    const hashedPassword = await bcrypt.hash(person.password, salt);
    person.password = hashedPassword; // Assign the hashed password back to the person object
    next();
  } catch (error) {
    return next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    //use bcrypt to compare the candidate password with the stored hashed password
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch; // Return true if the passwords match, false otherwise
  } catch (error) {
    throw error;
  }
};
const User = mongoose.model("user", userSchema);
module.exports = User;

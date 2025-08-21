const mongoose = require("mongoose");
const { type } = require("os");
// Define the schema for a person
// const bcrypt = require("bcrypt");
const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  party: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    require: true,
  },
  email: {
    type: String,
  },
  votes: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      votedAt: {
        type: Date, // mongoose provedes a Date type
        default: Date.now(),
      },
    },
  ],
  voteCount: {
    type: Number,
    default: 0,
  },
});
const candidate = mongoose.model("candidate", candidateSchema);
module.exports = candidate;

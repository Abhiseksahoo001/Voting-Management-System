const express = require("express");
const router = express.Router();
const User = require("../models/user");
// const passport = require("../OAuth");
const { jwtAuthMiddleware } = require("../jwt");
const Candidate = require("../models/candidate");
// Function to check if the user is an admin
const checkAdminRole = async (userID) => {
  try {
    const user = await User.findById(userID);
    if (!user) {
      throw new Error("User not found");
    } else if (user.role === "admin") {
      return true; // User is an admin
    }
  } catch (error) {
    console.error("Error checking admin role:", error);
    throw error;
  }
};

// Post route to add a candidate
router.post("/signup", jwtAuthMiddleware, async (req, res) => {
  try {
    const userData = req.user;
    const userId = userData.id;
    if (!(await checkAdminRole(userId))) {
      console.log("Admin role check failed");
      return res.status(403).json({ message: "Access denied. Admins only." });
    }
    const CandidateData = req.body;
    const newCandidate = new Candidate(CandidateData);
    const saveData = await newCandidate.save();
    console.log("data saved");
    res.status(200).json({ saveData: saveData }); // Send the token back to the client
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
});
// Get route to fetch all candidates
router.get("/AllData", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id))) {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }
    // ✅ Fetch all candidates from DB
    const candidates = await Candidate.find();

    if (!candidates || candidates.length === 0) {
      return res.status(404).json({ message: "No candidates found" });
    }

    console.log("✅ All candidates fetched successfully");
    res.status(200).json(candidates); // return the array of candidates
  } catch (err) {
    console.error("❌ Error fetching candidates:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//UPDATE OPERATION

router.put("/:candidateID", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id))) {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }
    const candidateID = req.params.candidateid; //Extract the id from the Url parameter
    const UpdateCandiDateData = req.body; //updated the data for the person
    const NewResponse = await Candidate.findByIdAndUpdate(
      candidateID,
      UpdatedPersonData,
      {
        new: true, // Return the  Updated document
        runValidators: true, //Run Mongoose validation
      }
    );
    if (!NewResponse) {
      return res.status(404).json({ error: "Candidate Not found" });
    }
    console.log("Data Updated Successfully");
    res.status(200).json(NewResponse);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal Server Error" });
  }
});

// DELETE OPERATION
router.delete("/:candidateId", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id))) {
      return res.status(404).json({ message: "Access denied. Admins only." });
    }
    const CandidateId = req.params.candidateId;
    const DeleteRES = await Candidate.findByIdAndDelete(CandidateId);

    if (!DeleteRES) {
      return res.status(404).json({ error: "Person not found" });
    }

    console.log("Data Deleted Successfully");
    res.status(200).json({ message: "Person deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.post("/vote/:candidateId", jwtAuthMiddleware, async (req, res) => {
  try {
    const candidateId = req.params.candidateId;
    const userId = req.user.id;
    const user = await User.findById(userId);
    // Check if the user has already voted
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVoted) {
      return res.status(400).json({ message: "You have already voted" });
    }
    // Admin not allowed to vote
    if (user.role === "admin") {
      return res
        .status(403)
        .json({ message: "Admins are not allowed to vote" });
    }

    // Add the vote
    candidate.votes.push({ user: userId });
    candidate.voteCount += 1;
    await candidate.save();
    // Update the user's voting status
    user.isVoted = true;
    await user.save();

    console.log("Vote recorded successfully");
    // res.status(200).json({ message: "Vote recorded successfully", candidate });
  } catch (err) {
    console.error("Error recording vote:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//vote count route
router.get("/voteCount", async (req, res) => {
  try {
    const candidate = await Candidate.find().sort({ voteCount: "desc" });
    //.select("name voteCount");
    //OR
    // Map the candidates and only their names and vote counts
    const record = candidate.map((data) => ({
      name: data.name,
      party: data.party,
      voteCount: data.voteCount,
    }));

    return res.status(200).json(record);
  } catch (err) {
    console.error("Error fetching vote count:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.get("/", async (req, res) => {
  try {
    // Find all candidates and select only the name and party fields, excluding _id
    const candidates = await Candidate.find({}, "name party -_id"); //{} like a filter which give selected value

    // Return the list of candidates
    res.status(200).json(candidates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = router;

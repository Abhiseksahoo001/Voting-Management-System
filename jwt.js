const jwt = require("jsonwebtoken");
const jwtAuthMiddleware = (req, res, next) => {
  //first check if the token is present in the request header
  const authentication = req.headers.authorization;
  if (!authentication || !authentication.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }
  //extract the token from the request header
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token find" });
  }
  try {
    //verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach the decoded user information to the request object
    next(); // Call the next middleware or route handler
  } catch (error) {
    console.error("JWT verification error:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
};
// function to generate a JWT token
const generateToken = (userData) => {
  return jwt.sign(userData, process.env.JWT_SECRET, {
    expiresIn: "24h", // Token will expire in 5 hours
  }); // Token will expire in 1 hour
};
module.exports = { jwtAuthMiddleware, generateToken };

import express from "express";
import UserDetails from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import auth from "../middleware/auth.js";


const router = express.Router();

// Get all users except the logged-in user
router.get("/users", auth, async (req, res) => {
try {
const users = await UserDetails.find({
username: { $ne: req.user.username },
}).select("username");


return res.json(users);


} catch (e) {
console.error("GET USERS ERROR:", e.message);
return res.status(500).json({ error: "Failed to fetch users" });
}
});

// Register
router.post("/register", async (req, res) => {
try {
const { username, password } = req.body;


if (!username || !password) {
  return res.status(400).json({
    error: "Username and password are required",
  });
}

if (password.length < 8) {
  return res.status(400).json({
    error: "Password must be at least 8 characters long",
  });
}

const existingUser = await UserDetails.findOne({ username });

if (existingUser) {
  return res.status(409).json({
    error: "Username is already taken",
  });
}

const hashedPassword = await bcrypt.hash(password, 10);

await UserDetails.create({
  username,
  password: hashedPassword,
});

return res.status(201).json({
  message: "User created successfully",
});


} catch (e) {
console.error("REGISTER ERROR:", e.message);


if (e.code === 11000) {
  return res.status(409).json({
    error: "Username is already taken",
  });
}

return res.status(500).json({
  error: "Registration failed",
});


}
});

// Login
router.post("/login", async (req, res) => {
try {
const { username, password } = req.body;


if (!username || !password) {
  return res.status(400).json({
    error: "Username and password are required",
  });
}

const user = await UserDetails.findOne({ username });

if (!user) {
  return res.status(401).json({
    error: "Invalid username or password",
  });
}

const isMatch = await bcrypt.compare(password, user.password);

if (!isMatch) {
  return res.status(401).json({
    error: "Invalid username or password",
  });
}

if (!process.env.JWT_TOKEN) {
  throw new Error("JWT_TOKEN is missing from environment variables");
}

const token = jwt.sign(
  {
    id: user._id.toString(),
    username: user.username,
  },
  process.env.JWT_TOKEN,
  { expiresIn: "1h" }
);

return res.json({
  token,
  username: user.username,
});


} catch (e) {
console.error("LOGIN ERROR:", e.message);


return res.status(500).json({
  error: "Login failed",
});


}
});

export default router;

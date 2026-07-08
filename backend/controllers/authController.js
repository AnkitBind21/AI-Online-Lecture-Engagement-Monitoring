import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { sendSuccess, ApiError } from "../utils/apiResponse.js";
import { requireFields, isValidEmail } from "../utils/validators.js";

/**
 * @desc    Register a new teacher
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerTeacher = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  requireFields(req.body, ["name", "email", "password"]);

  if (!isValidEmail(email)) {
    throw new ApiError(400, "Please provide a valid email address");
  }

  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters long");
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const user = await User.create({ name, email, password });

  const token = generateToken(user._id);

  sendSuccess(res, 201, "Teacher registered successfully", {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      theme: user.theme,
    },
  });
});

/**
 * @desc    Login a teacher
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginTeacher = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  requireFields(req.body, ["email", "password"]);

  // password has select:false on the schema, so explicitly include it here
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password"
  );

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = generateToken(user._id);

  sendSuccess(res, 200, "Login successful", {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      theme: user.theme,
    },
  });
});

/**
 * @desc    Get the logged-in teacher's own profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, "Profile fetched successfully", {
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    theme: req.user.theme,
  });
});

/**
 * @desc    Update the logged-in teacher's profile (name / email)
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  if (email && !isValidEmail(email)) {
    throw new ApiError(400, "Please provide a valid email address");
  }

  if (email) {
    const existing = await User.findOne({
      email: email.toLowerCase(),
      _id: { $ne: req.user._id },
    });
    if (existing) {
      throw new ApiError(409, "This email is already in use");
    }
  }

  const user = await User.findById(req.user._id);
  if (name) user.name = name;
  if (email) user.email = email.toLowerCase();
  await user.save();

  sendSuccess(res, 200, "Profile updated successfully", {
    id: user._id,
    name: user.name,
    email: user.email,
    theme: user.theme,
  });
});

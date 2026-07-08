import User from "../models/User.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { sendSuccess, ApiError } from "../utils/apiResponse.js";
import { requireFields, isValidEmail } from "../utils/validators.js";

/**
 * @desc    Get current teacher settings
 * @route   GET /api/settings
 * @access  Private
 */
export const getSettings = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, "Settings fetched successfully", {
    name: req.user.name,
    email: req.user.email,
    theme: req.user.theme,
  });
});

/**
 * @desc    Update name / email
 * @route   PUT /api/settings/profile
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
  if (email) user.email = email;
  await user.save();

  sendSuccess(res, 200, "Profile updated successfully", {
    name: user.name,
    email: user.email,
    theme: user.theme,
  });
});

/**
 * @desc    Change password
 * @route   PUT /api/settings/password
 * @access  Private
 */
export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  requireFields(req.body, ["currentPassword", "newPassword"]);

  if (newPassword.length < 6) {
    throw new ApiError(400, "New password must be at least 6 characters long");
  }

  const user = await User.findById(req.user._id).select("+password");

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(401, "Current password is incorrect");
  }

  user.password = newPassword; // pre-save hook re-hashes it
  await user.save();

  sendSuccess(res, 200, "Password updated successfully", null);
});

/**
 * @desc    Update theme preference
 * @route   PUT /api/settings/theme
 * @access  Private
 */
export const updateTheme = asyncHandler(async (req, res) => {
  const { theme } = req.body;

  requireFields(req.body, ["theme"]);

  if (!["light", "dark"].includes(theme)) {
    throw new ApiError(400, "theme must be either 'light' or 'dark'");
  }

  const user = await User.findById(req.user._id);
  user.theme = theme;
  await user.save();

  sendSuccess(res, 200, "Theme updated successfully", { theme: user.theme });
});
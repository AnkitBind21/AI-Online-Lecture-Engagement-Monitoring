import jwt from "jsonwebtoken";
import asyncHandler from "./asyncHandler.js";
import { ApiError } from "../utils/apiResponse.js";
import User from "../models/User.js";

/**
 * protect
 * Verifies the Bearer JWT sent in the Authorization header, loads the
 * corresponding teacher (without password) and attaches it to req.user.
 * Any protected route (rooms create, sessions, reports, settings) uses this.
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    throw new ApiError(401, "Not authorized, no token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new ApiError(401, "Not authorized, user no longer exists");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, "Not authorized, token invalid or expired");
  }
});
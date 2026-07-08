import jwt from "jsonwebtoken";

/**
 * generateToken
 * Signs a JWT containing the teacher's id, valid for JWT_EXPIRES_IN
 * (defaults to 7 days if not set in .env).
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

export default generateToken;
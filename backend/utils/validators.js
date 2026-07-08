import { ApiError } from "./apiResponse.js";

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const ROOM_CODE_REGEX = /^[A-Z0-9]{6}$/;

/**
 * requireFields
 * Throws a 400 ApiError listing any missing fields from req.body.
 */
export const requireFields = (body, fields) => {
  const missing = fields.filter(
    (field) => body[field] === undefined || body[field] === null || body[field] === ""
  );

  if (missing.length > 0) {
    throw new ApiError(400, `Missing required field(s): ${missing.join(", ")}`);
  }
};

/**
 * isValidEmail
 */
export const isValidEmail = (email) => EMAIL_REGEX.test(String(email));

/**
 * isValidRoomCode
 * Room codes must be exactly 6 uppercase letters/numbers.
 */
export const isValidRoomCode = (code) =>
  typeof code === "string" && ROOM_CODE_REGEX.test(code.toUpperCase());
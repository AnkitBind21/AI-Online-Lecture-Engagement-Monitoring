import Room from "../models/Room.js";

const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const CODE_LENGTH = 6;

/**
 * generateRandomCode
 * Builds a random 6-character uppercase alphanumeric string.
 */
const generateRandomCode = () => {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CHARSET.charAt(Math.floor(Math.random() * CHARSET.length));
  }
  return code;
};

/**
 * generateUniqueRoomCode
 * Keeps generating random codes until one that doesn't already
 * exist in the database is found. Prevents duplicate room codes.
 */
const generateUniqueRoomCode = async () => {
  let code;
  let exists = true;

  while (exists) {
    code = generateRandomCode();
    // eslint-disable-next-line no-await-in-loop
    exists = await Room.exists({ roomCode: code });
  }

  return code;
};

export default generateUniqueRoomCode;
/**
 * sendSuccess
 * Sends a consistent success response shape across the whole API:
 * { success: true, message, data }
 */
export const sendSuccess = (res, statusCode, message, data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * ApiError
 * A custom error class that carries an HTTP status code, so the
 * central error middleware knows what status to respond with.
 */
export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}
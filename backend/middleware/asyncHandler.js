/**
 * asyncHandler
 * Wraps an async route/controller function so that any thrown error
 * (or rejected promise) is automatically forwarded to Express's
 * error-handling middleware via next(error), instead of needing a
 * try/catch block in every single controller.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;

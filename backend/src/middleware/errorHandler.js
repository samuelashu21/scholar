import { errorResponse } from "../utils/apiResponse.js";
import { ErrorCodes } from "../utils/errorCodes.js";

const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);

  const response = errorResponse({
    message: error.message || "Server error",
    code: error.code || (statusCode === 400
      ? ErrorCodes.BAD_REQUEST
      : statusCode === 401
      ? ErrorCodes.UNAUTHORIZED
      : statusCode === 403
      ? ErrorCodes.FORBIDDEN
      : statusCode === 404
      ? ErrorCodes.NOT_FOUND
      : statusCode === 429
      ? ErrorCodes.RATE_LIMITED
      : ErrorCodes.INTERNAL_ERROR),
    details: process.env.NODE_ENV === "production" ? undefined : { stack: error.stack },
  });

  res.status(statusCode).json(response);
};

export default errorHandler;

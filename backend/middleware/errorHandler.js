import { errorResponse } from "../src/utils/apiResponse.js";
import { ErrorCodes } from "../src/utils/errorCodes.js";

const errorCodeByStatus = {
  400: ErrorCodes.BAD_REQUEST,
  401: ErrorCodes.UNAUTHORIZED,
  403: ErrorCodes.FORBIDDEN,
  404: ErrorCodes.NOT_FOUND,
  409: ErrorCodes.CONFLICT,
  429: ErrorCodes.RATE_LIMITED,
};

const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  const code = error.code || errorCodeByStatus[statusCode] || ErrorCodes.INTERNAL_ERROR;

  res.status(statusCode).json(
    errorResponse({
      message: error.message || "Server error",
      code,
      details: process.env.NODE_ENV === "production" ? undefined : { stack: error.stack },
    })
  );
};

export default errorHandler;

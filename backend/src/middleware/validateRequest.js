import AppError from "../utils/appError.js";
import { ErrorCodes } from "../utils/errorCodes.js";

const validateRequest = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return next(
      new AppError("Validation failed", {
        statusCode: 400,
        code: ErrorCodes.BAD_REQUEST,
        details: error.details?.map((d) => d.message) || [],
      })
    );
  }

  req.body = value;
  return next();
};

export default validateRequest;

export const successResponse = ({ message = "Success", data = null, meta = undefined } = {}) => {
  const payload = { success: true, message, data };
  if (meta !== undefined) payload.meta = meta;
  return payload;
};

export const errorResponse = ({ message = "Request failed", code = "INTERNAL_ERROR", details = undefined } = {}) => {
  const payload = {
    success: false,
    message,
    error: { code },
  };

  if (details !== undefined) payload.error.details = details;

  return payload;
};

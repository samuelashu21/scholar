import crypto from "crypto";

const CSRF_COOKIE = "csrfToken";
const CSRF_HEADER = "x-csrf-token";
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export const ensureCsrfCookie = (req, res, next) => {
  if (!req.cookies?.[CSRF_COOKIE]) {
    const token = crypto.randomBytes(32).toString("hex");
    const isProd = process.env.NODE_ENV === "production";

    res.cookie(CSRF_COOKIE, token, {
      httpOnly: false,
      secure: isProd,
      sameSite: isProd ? "strict" : "lax",
      path: "/api",
      maxAge: 24 * 60 * 60 * 1000,
    });
  }

  next();
};

export const csrfProtection = ({ allowedOrigins = [] } = {}) => (req, res, next) => {
  if (SAFE_METHODS.has(req.method)) return next();

  const hasAuthCookie = Boolean(req.cookies?.jwt || req.cookies?.refreshToken);
  if (!hasAuthCookie) return next();

  const origin = req.get("origin");
  const isBrowserRequest = Boolean(origin);
  if (!isBrowserRequest) return next();

  if (allowedOrigins.length > 0 && !allowedOrigins.includes(origin)) {
    return res.status(403).json({
      success: false,
      message: "Invalid request origin",
      error: { code: "FORBIDDEN" },
    });
  }

  const csrfFromCookie = req.cookies?.[CSRF_COOKIE];
  const csrfFromHeader = req.get(CSRF_HEADER);

  if (!csrfFromCookie) return next();

  if (!csrfFromHeader || csrfFromCookie !== csrfFromHeader) {
    return res.status(403).json({
      success: false,
      message: "CSRF token validation failed",
      error: { code: "FORBIDDEN" },
    });
  }

  return next();
};

import { API_ROUTES } from "../constants/apiRoutes";
import { apiRequest } from "./api";
import type { SessionUser } from "../types/auth";

export const authService = {
  login: (payload: { email?: string; phone?: string; password: string }) =>
    apiRequest<SessionUser>(API_ROUTES.auth.login, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  logout: () =>
    apiRequest<null>(API_ROUTES.auth.logout, {
      method: "POST",
    }),
  me: () => apiRequest<SessionUser>(API_ROUTES.auth.me),
  refresh: () =>
    apiRequest<{ accessToken?: string }>(API_ROUTES.auth.refresh, {
      method: "POST",
    }),
};

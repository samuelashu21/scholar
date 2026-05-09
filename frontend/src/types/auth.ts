export type SessionUser = {
  _id?: string;
  email?: string;
  name?: string;
  token?: string;
  [key: string]: unknown;
};

export type ApiSuccess<T> = {
  success?: true;
  message?: string;
  data: T;
  meta?: unknown;
};

export type ApiErrorEnvelope = {
  success?: false;
  message?: string;
  error?: {
    code?: string;
    details?: unknown;
  };
};

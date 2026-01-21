export class TunaSdkError extends Error {
  cause?: unknown;
  status: number;

  constructor(message: string, status: number, cause?: unknown) {
    super(message);
    this.name = "TunaSdkError";
    this.status = status;

    if (cause !== undefined) {
      this.cause = cause;
    }
  }
}

export const tunaSdkErrorInterceptor = (error: unknown, response?: Response) => {
  const status = response?.status ?? 0;
  const message = status ? `HTTP ${status}` : "Network error";
  return new TunaSdkError(message, status, error);
};

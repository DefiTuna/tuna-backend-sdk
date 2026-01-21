export class TunaBackendSdkError<TCause = unknown> extends Error {
  cause?: TCause;
  status: number;

  constructor(message: string, status: number, cause?: TCause) {
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
  return new TunaBackendSdkError(message, status, error);
};

export const isTunaSdkError = <TCause = unknown>(error: unknown): error is TunaBackendSdkError<TCause> =>
  error instanceof TunaBackendSdkError;

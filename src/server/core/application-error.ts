import "server-only";

export class ApplicationError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApplicationError";
    this.status = status;
    this.details = details;
  }
}

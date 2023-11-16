export class HandledError extends Error {
  statusCode: number;
  reason: string;
  constructor(message: string, statusCode: number, reason?: string) {
    super(message);
    this.statusCode = statusCode;
    this.reason = reason;
  }
}
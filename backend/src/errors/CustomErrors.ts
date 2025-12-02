export class CustomError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public field?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

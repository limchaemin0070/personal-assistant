import { Request, Response, NextFunction, RequestHandler } from "express";

export const asyncHandler =
  (
    handler: (req: Request, res: Response, next: NextFunction) => Promise<any>
  ): RequestHandler =>
  (req, res, next) => {
    handler(req, res, next).catch(next);
  };

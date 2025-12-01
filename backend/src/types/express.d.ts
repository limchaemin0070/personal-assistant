import { TokenPayload } from "../utils/authentication/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}
export {};

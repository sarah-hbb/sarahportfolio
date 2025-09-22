import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";
import errorHandler from "./error";

// Extend Express Request to include user
export interface AuthenticatedRequest extends Request {
  user?: string | JwtPayload;
}

const verifyToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.access_token;
  if (!token) {
    return next(errorHandler(401, "Unauthorized"));
  }
  jwt.verify(
    token,
    process.env.JWT_SECRET_KEY as string,
    (err: VerifyErrors | null, user: JwtPayload | string | undefined) => {
      if (err) {
        return next(errorHandler(401, "Unauthorized"));
      }
      req.user = user;
      next();
    }
  );
};

export default verifyToken;

import { Request } from "express";

// creating generic Authentication interface to use for different params, res body, req body, req query
export interface AuthenticatedRequest<
  P = {},
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user?: {
    id: string;
    isAdmin?: boolean;
  };
}

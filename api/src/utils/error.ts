import { AppError } from "./AppError.types";

const errorHandler = (statusCode: number, message: string): AppError => {
  const error = new Error() as AppError;
  error.statusCode = statusCode;
  error.message = message;
  return error;
};

export default errorHandler;

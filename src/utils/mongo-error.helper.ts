import { ConflictException, type Logger } from "@nestjs/common";
import type { MongoServerError } from "mongodb";

export function throwErrorIfDuplicated(error: MongoServerError, logger?: Logger): void {
  if (error.code === 11000) {
    const errorMsg = error.message;
    const duplicatedError = new ConflictException(errorMsg);

    logger?.error(errorMsg, duplicatedError.stack, "Mongo");
    throw duplicatedError;
  }
}

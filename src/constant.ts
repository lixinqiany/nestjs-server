export const isDev = process.env.NODE_ENV === "development";
export const SERVER_PORT: number = process.env.SERVER_PORT
  ? parseInt(process.env.SERVER_PORT)
  : 3000;

const parseIntIfNumeric = (value: string | undefined): string | number | undefined => {
  if (value && /^\d+$/.test(value)) {
    return parseInt(value, 10);
  }
  return value;
};
export const LOG_LEVEL: string | undefined = process.env.LOG_LEVEL || undefined;
export const MAX_SIZE_PER_LOG_FILE: string | number =
  parseIntIfNumeric(process.env.MAX_SIZE_PER_LOG_FILE) || "20m";
export const MAX_LOG_FILES: string | number | undefined =
  parseIntIfNumeric(process.env.MAX_LOG_FILES) || undefined;
export const LOG_DATE_PATTERN: string = process.env.LOG_DATE_PATTERN || "YYYY-MM-DD";

export const REDIS_HOST: string = process.env.REDIS_HOST ?? "localhost";
export const REDIS_PORT: number = parseInt(process.env.REDIS_PORT || "6379", 10);
export const REDIS_USERNAME: string | undefined = process.env.REDIS_USERNAME || undefined;
export const REDIS_PASSWORD: string | undefined = process.env.REDIS_PASSWORD || undefined;
export const REDIS_DB: number = parseInt(process.env.REDIS_DB || "0", 10);
export const REDIS_SENTINEL_NAME: string | undefined = process.env.REDIS_SENTINEL_NAME || undefined;
export const REDIS_SENTINEL_HOSTS: string | undefined =
  process.env.REDIS_SENTINEL_HOSTS || undefined;
export const REDIS_SENTINEL_USERNAME: string | undefined =
  process.env.REDIS_SENTINEL_USERNAME || undefined;
export const REDIS_SENTINEL_PASSWORD: string | undefined =
  process.env.REDIS_SENTINEL_PASSWORD || undefined;

export const MONGODB_REPLICA_SET_NAME: string | undefined =
  process.env.MONGODB_REPLICA_SET_NAME || undefined;
export const MONGODB_REPLICA_SET_HOSTS: string | undefined =
  process.env.MONGODB_REPLICA_SET_HOSTS || undefined;
export const MONGODB_HOST = process.env.MONGODB_HOST || "localhost";
export const MONGODB_PORT = parseInt(process.env.MONGODB_PORT || "27017", 10);
export const MONGODB_DATABASE = process.env.MONGODB_DATABASE || "test";
export const MONGODB_USERNAME: string | undefined = process.env.MONGODB_USERNAME || undefined;
export const MONGODB_PASSWORD: string | undefined = process.env.MONGODB_PASSWORD || undefined;
export const MONGODB_AUTHENTICATION_DATABASE: string | undefined =
  process.env.MONGODB_AUTHENTICATION_DATABASE || undefined;

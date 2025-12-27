export const isDev = process.env.NODE_ENV === 'development';
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
  parseIntIfNumeric(process.env.MAX_SIZE_PER_LOG_FILE) || '20m';
export const MAX_LOG_FILES: string | number | undefined =
  parseIntIfNumeric(process.env.MAX_LOG_FILES) || undefined;
export const LOG_DATE_PATTERN: string = process.env.LOG_DATE_PATTERN || 'YYYY-MM-DD';

import * as dotenv from "dotenv";
import * as path from "path";
import { log } from "node:console";

function loadEnv(): void {
  const envPath = path.resolve(__dirname, "..", ".env");
  const result = dotenv.config({ path: envPath });

  if (result.error) {
    log("[Migration] 未找到 .env 文件，将使用当前系统环境变量");
  } else {
    log("[Migration] 环境变量加载成功");
  }
}

// 立即执行
loadEnv();

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

import * as dotenv from 'dotenv';
import * as path from 'path';
import { log } from 'node:console';

/**
 * Application warm-up script.
 * Loads environment variables from .env file at startup.
 */
function warmUp() {
  // __dirname is the directory name of the current script
  const envPath = path.resolve(__dirname, '..', '.env');
  const result = dotenv.config({ path: envPath });

  if (result.error) {
    log('未找到 .env 文件，将使用当前系统环境变量');
  } else {
    log('环境变量加载成功');
  }
}

// Execute warm-up logic immediately
warmUp();

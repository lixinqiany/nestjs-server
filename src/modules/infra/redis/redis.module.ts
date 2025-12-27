import { Global, Inject, Logger, Module, OnApplicationShutdown } from "@nestjs/common";
import { Redis, RedisOptions } from "ioredis";
import {
  REDIS_DB,
  REDIS_HOST,
  REDIS_PASSWORD,
  REDIS_PORT,
  REDIS_SENTINEL_HOSTS,
  REDIS_SENTINEL_NAME,
  REDIS_SENTINEL_PASSWORD,
  REDIS_SENTINEL_USERNAME,
  REDIS_USERNAME,
} from "#/constant";
import { REDIS_CLIENT, REDIS_OPTIONS, REDIS_READ_CLIENT } from "./redis.constants";

class RedisLifecycle implements OnApplicationShutdown {
  constructor(
    @Inject(REDIS_CLIENT) private readonly client: Redis,
    @Inject(REDIS_READ_CLIENT) private readonly slaveClient: Redis,
    private readonly logger: Logger,
  ) {}

  async onApplicationShutdown(signal?: string): Promise<void> {
    try {
      this.logger.log("Closing Redis connection!!", "RedisModule");
      await Promise.all([this.client.quit(), this.slaveClient.quit()]);
      this.logger.log(
        `Redis connection closed${signal ? ` (signal: ${signal})` : ""}`,
        "RedisModule",
      );
    } catch (e) {
      this.logger.error(e, undefined, "RedisModule");
    }
  }
}

const getRedisOptions = (): RedisOptions => {
  const baseOptions = {
    username: REDIS_USERNAME || undefined,
    password: REDIS_PASSWORD || undefined,
    db: REDIS_DB,
  };

  if (REDIS_SENTINEL_HOSTS && REDIS_SENTINEL_NAME) {
    const sentinels = REDIS_SENTINEL_HOSTS.split(",").map((s) => {
      const [host, port] = s.trim().split(":");
      return { host, port: parseInt(port, 10) };
    });

    return {
      ...baseOptions,
      sentinels,
      name: REDIS_SENTINEL_NAME,
      sentinelUsername: REDIS_SENTINEL_USERNAME || undefined,
      sentinelPassword: REDIS_SENTINEL_PASSWORD || undefined,
    };
  }

  return {
    ...baseOptions,
    host: REDIS_HOST,
    port: REDIS_PORT,
  };
};

const createRedisClient = (
  options: RedisOptions,
  logger: Logger,
  role: "Master" | "Slave",
): Redis => {
  if (options.sentinels) {
    logger.debug(
      `Connecting to Redis Sentinel (${role}): name=${options.name}, sentinels=${JSON.stringify(options.sentinels)}, db=${options.db}`,
    );
  } else {
    logger.debug(
      `Connecting to Redis Standalone${role === "Slave" ? " (Slave==Master)" : ""}: host=${options.host}, port=${options.port}, db=${options.db}`,
    );
  }

  const client = new Redis(options);

  const roleMsg =
    role === "Master" ? "Master" : options.sentinels ? "Slave" : "Slave==Master(Standalone)";
  client.on("connect", () => {
    logger.log(`Redis (${roleMsg}) connected`, "RedisModule");
  });

  client.on("error", (err) => {
    logger.error(`Redis (${roleMsg}) connection error: ${err.message}`, err.stack, "RedisModule");
  });

  return client;
};

@Global()
@Module({
  providers: [
    {
      provide: REDIS_OPTIONS,
      useFactory: (): RedisOptions => {
        return getRedisOptions();
      },
    },
    {
      provide: REDIS_CLIENT,
      inject: [REDIS_OPTIONS, Logger],
      useFactory: (options: RedisOptions, logger: Logger): Redis => {
        return createRedisClient(options, logger, "Master");
      },
    },
    {
      provide: REDIS_READ_CLIENT,
      inject: [REDIS_OPTIONS, Logger],
      useFactory: (options: RedisOptions, logger: Logger): Redis => {
        // 创建浅拷贝，避免污染原始配置
        const slaveOptions = { ...options };

        if (slaveOptions.sentinels) {
          slaveOptions.role = "slave";
        }

        return createRedisClient(slaveOptions, logger, "Slave");
      },
    },
    RedisLifecycle,
  ],
  exports: [REDIS_CLIENT, REDIS_READ_CLIENT],
})
export class RedisModule {}

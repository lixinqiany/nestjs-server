import { Module } from "@nestjs/common";
import { LoggerModule } from "./modules/infra/logger.module";
import { MongoModule } from "./modules/infra/mongo.module";
import { RedisModule } from "./modules/infra/redis/redis.module";

@Module({
  imports: [LoggerModule, RedisModule, MongoModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

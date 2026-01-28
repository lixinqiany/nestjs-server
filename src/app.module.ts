import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { LoggerModule } from "./modules/infra/logger.module";
import { MongoModule } from "./modules/infra/mongo.module";
import { RedisModule } from "./modules/infra/redis/redis.module";

@Module({
  imports: [LoggerModule, RedisModule, MongoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

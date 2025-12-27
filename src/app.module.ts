import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { LoggerModule } from "./modules/infra/logger.module";
import { RedisModule } from "./modules/infra/redis/redis.module";

@Module({
  imports: [LoggerModule, RedisModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

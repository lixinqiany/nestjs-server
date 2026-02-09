import { Module, ValidationPipe } from "@nestjs/common";
import { APP_PIPE } from "@nestjs/core";
import { LoggerModule } from "./modules/infra/logger.module";
import { MongoModule } from "./modules/infra/mongo.module";
import { RedisModule } from "./modules/infra/redis/redis.module";
import { UserModule } from "./modules/user/user.module";

@Module({
  imports: [LoggerModule, RedisModule, MongoModule, UserModule],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true, // 自动移除 DTO 中未定义的属性
        transform: true, // 自动转换类型
      }),
    },
  ],
})
export class AppModule {}

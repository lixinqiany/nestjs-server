import { Module } from "@nestjs/common";
import { MongooseModule, type MongooseModuleOptions } from "@nestjs/mongoose";
import {
  MONGODB_USERNAME,
  MONGODB_PASSWORD,
  MONGODB_REPLICA_SET_HOSTS,
  MONGODB_HOST,
  MONGODB_PORT,
  MONGODB_REPLICA_SET_NAME,
  MONGODB_AUTHENTICATION_DATABASE,
  MONGODB_DATABASE,
} from "#/constant";

export function getMongoURI(): string {
  const hosts = MONGODB_REPLICA_SET_HOSTS || `${MONGODB_HOST}:${MONGODB_PORT}`;
  return `mongodb://${hosts}`;
}

export function getMongooseOptions(): MongooseModuleOptions {
  const options: MongooseModuleOptions = {
    dbName: MONGODB_DATABASE,
    user: MONGODB_USERNAME,
    pass: MONGODB_PASSWORD,
    /** 设置为 false 以禁用与此连接关联的所有模型的自动索引创建。 */
    autoIndex: false,
    /** 设置为 `false` 以禁用 Mongoose 在此连接上创建的每个模型上自动调用 `createCollection()`。 */
    autoCreate: false,
  };
  if (MONGODB_AUTHENTICATION_DATABASE) {
    options.authSource = MONGODB_AUTHENTICATION_DATABASE;
  }
  if (MONGODB_REPLICA_SET_NAME) {
    options.replicaSet = MONGODB_REPLICA_SET_NAME;
  }
  return options;
}

@Module({
  imports: [MongooseModule.forRoot(getMongoURI(), getMongooseOptions())],
})
export class MongoModule {}

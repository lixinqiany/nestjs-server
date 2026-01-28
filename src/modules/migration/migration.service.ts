import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Migration } from "./migration.schema";

@Injectable()
export class MigrationService implements OnApplicationBootstrap {
  private readonly logger = new Logger(MigrationService.name);

  constructor(@InjectModel(Migration.name) private migrationModel: Model<Migration>) {}

  public onApplicationBootstrap() {
    this.logger.log("应用启动，MigrationService 已就绪");
  }
}

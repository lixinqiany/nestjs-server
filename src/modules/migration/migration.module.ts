import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MigrationService } from "./migration.service";
import { Migration, MigrationSchema } from "./migration.schema";

@Module({
  imports: [MongooseModule.forFeature([{ name: Migration.name, schema: MigrationSchema }])],
  controllers: [],
  providers: [MigrationService],
  exports: [MigrationService],
})
export class MigrationModule {}

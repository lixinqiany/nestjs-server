import type { Connection } from "mongoose";
import { AbstractMigration } from "../abstract.migration";

export class MigrationCollectionCreation extends AbstractMigration {
  constructor(connection: Connection) {
    super(connection);
  }

  public async up(): Promise<void> {
    const collectionName = "migrations";

    // 创建 migrations 集合
    await this.createCollectionIfNotExists(collectionName);

    // 为 fileName 创建唯一索引
    await this.createIndexIfNotExists(collectionName, { fileName: 1 }, "idx_fileName_unique", {
      unique: true,
    });

    // 为 version + order + name 创建联合唯一索引
    await this.createIndexIfNotExists(
      collectionName,
      { version: 1, order: 1, name: 1 },
      "idx_version_order_name_unique",
      { unique: true },
    );
  }
}

import type { Connection } from "mongoose";
import chalk from "chalk";
import { log } from "node:console";
import { AbstractMigration } from "../abstract.migration";

const PREFIX = chalk.magenta("[v0.0.0_create-migration_0001]");

export default class MigrationCollectionCreation extends AbstractMigration {
  constructor(connection: Connection) {
    super(connection);
  }

  public async up(): Promise<void> {
    const collectionName = "migrations";

    await this.createCollectionIfNotExists(collectionName);
    log(`${PREFIX} 集合 ${chalk.cyan(collectionName)} 已创建`);

    await this.createIndexIfNotExists(collectionName, { fileName: 1 }, "idx_fileName_unique", {
      unique: true,
    });
    log(`${PREFIX} 索引 ${chalk.cyan("idx_fileName_unique")} 已创建`);

    await this.createIndexIfNotExists(
      collectionName,
      { version: 1, order: 1, name: 1 },
      "idx_version_order_name_unique",
      { unique: true },
    );
    log(`${PREFIX} 索引 ${chalk.cyan("idx_version_order_name_unique")} 已创建`);
  }
}

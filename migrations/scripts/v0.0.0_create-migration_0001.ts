import type { Connection } from "mongoose";
import chalk from "chalk";
import { log } from "node:console";
import { AbstractMigration } from "../abstract.migration";

const PREFIX = chalk.magenta("[v0.0.0_create-migration_0001]");
const COLLECTION = "migrations";

export default class MigrationCollectionCreation extends AbstractMigration {
  constructor(connection: Connection) {
    super(connection);
  }

  public async up(): Promise<void> {
    await this.createCollectionIfNotExists(COLLECTION);
    log(`${PREFIX} 集合 ${chalk.cyan(COLLECTION)} 已创建`);

    await this.createIndexIfNotExists(COLLECTION, { fileName: 1 }, "idx_fileName_unique", {
      unique: true,
    });
    log(`${PREFIX} 索引 ${chalk.cyan("idx_fileName_unique")} 已创建`);

    await this.createIndexIfNotExists(
      COLLECTION,
      { version: 1, order: 1, name: 1 },
      "idx_version_order_name_unique",
      { unique: true },
    );
    log(`${PREFIX} 索引 ${chalk.cyan("idx_version_order_name_unique")} 已创建`);
  }

  public async down(): Promise<void> {
    await this.dropIndexIfExists(COLLECTION, "idx_version_order_name_unique");
    log(`${PREFIX} 索引 ${chalk.yellow("idx_version_order_name_unique")} 已删除`);

    await this.dropIndexIfExists(COLLECTION, "idx_fileName_unique");
    log(`${PREFIX} 索引 ${chalk.yellow("idx_fileName_unique")} 已删除`);

    await this.dropCollectionIfExists(COLLECTION);
    log(`${PREFIX} 集合 ${chalk.yellow(COLLECTION)} 已删除`);
  }
}

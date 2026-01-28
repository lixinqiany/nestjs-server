import type { Connection } from "mongoose";
import chalk from "chalk";
import { log } from "node:console";
import { AbstractMigration } from "../abstract.migration";

const PREFIX = chalk.magenta("[v0.0.1_create-users_0001]");
const COLLECTION = "users";

export default class CreateUsersCollection extends AbstractMigration {
  constructor(connection: Connection) {
    super(connection);
  }

  public async up(): Promise<void> {
    await this.createCollectionIfNotExists(COLLECTION);
    log(`${PREFIX} 集合 ${chalk.cyan(COLLECTION)} 已创建`);

    await this.createIndexIfNotExists(COLLECTION, { username: 1 }, "idx_username_unique", {
      unique: true,
    });
    log(`${PREFIX} 索引 ${chalk.cyan("idx_username_unique")} 已创建`);

    await this.createIndexIfNotExists(COLLECTION, { mobilePhone: 1 }, "idx_mobilePhone_unique", {
      unique: true,
    });
    log(`${PREFIX} 索引 ${chalk.cyan("idx_mobilePhone_unique")} 已创建`);

    await this.createIndexIfNotExists(COLLECTION, { email: 1 }, "idx_email_unique", {
      unique: true,
      sparse: true, // 只对有值的字段进行唯一性检查
    });
    log(`${PREFIX} 索引 ${chalk.cyan("idx_email_unique")} (sparse) 已创建`);
  }

  public async down(): Promise<void> {
    await this.dropIndexIfExists(COLLECTION, "idx_email_unique");
    log(`${PREFIX} 索引 ${chalk.yellow("idx_email_unique")} 已删除`);

    await this.dropIndexIfExists(COLLECTION, "idx_mobilePhone_unique");
    log(`${PREFIX} 索引 ${chalk.yellow("idx_mobilePhone_unique")} 已删除`);

    await this.dropIndexIfExists(COLLECTION, "idx_username_unique");
    log(`${PREFIX} 索引 ${chalk.yellow("idx_username_unique")} 已删除`);

    await this.dropCollectionIfExists(COLLECTION);
    log(`${PREFIX} 集合 ${chalk.yellow(COLLECTION)} 已删除`);
  }
}

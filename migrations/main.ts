import "./config";
import mongoose, { type Connection } from "mongoose";
import { readdir } from "fs/promises";
import { join } from "path";
import semver from "semver";
import chalk from "chalk";
import type { MigrationFileInfo, MigrationRecord } from "./types";
import type { AbstractMigration } from "./abstract.migration";
import {
  MONGODB_USERNAME,
  MONGODB_PASSWORD,
  MONGODB_REPLICA_SET_HOSTS,
  MONGODB_HOST,
  MONGODB_PORT,
  MONGODB_REPLICA_SET_NAME,
  MONGODB_AUTHENTICATION_DATABASE,
  MONGODB_DATABASE,
} from "./config";
import { log, error } from "node:console";

/** 迁移脚本目录 */
const SCRIPTS_DIR = join(__dirname, "scripts");
/** 迁移集合名称 */
const MIGRATION_COLLECTION = "migrations";
/**
 * @description 迁移脚本命名规范为：v{version}_{name}_{order}.ts
 * ^v表示字符串开头为v，\.ts$表示文件结尾必须是.ts
 * \\d+表示一个或多个数字，\.表示一个点，(\d+\.\d+\.\d+) 捕获版本号
 * .表示匹配除换行外任意字符，.+ 表示一个或多个任意字符 (.+) 捕获名称
 * \d+表示一个或多个数字，(\d+) 捕获顺序
 */
const MIGRATION_FILE_REGEX = /^v(\d+\.\d+\.\d+)_(.+)_(\d+)\.ts$/;

// 日志前缀
const PREFIX = chalk.blue("[Migration]");

function getMongoURI(): string {
  const hosts = MONGODB_REPLICA_SET_HOSTS || `${MONGODB_HOST}:${MONGODB_PORT}`;
  return `mongodb://${hosts}`;
}

async function connectMongo(): Promise<Connection> {
  const uri = getMongoURI();
  const options: mongoose.ConnectOptions = {
    dbName: MONGODB_DATABASE,
    user: MONGODB_USERNAME,
    pass: MONGODB_PASSWORD,
  };

  if (MONGODB_AUTHENTICATION_DATABASE) options.authSource = MONGODB_AUTHENTICATION_DATABASE;
  if (MONGODB_REPLICA_SET_NAME) options.replicaSet = MONGODB_REPLICA_SET_NAME;

  await mongoose.connect(uri, options);
  log(`${PREFIX} ${chalk.green("已连接")} ${chalk.gray(`${uri}/${MONGODB_DATABASE}`)}`);

  return mongoose.connection;
}

async function scanMigrationFiles(): Promise<string[]> {
  const files = await readdir(SCRIPTS_DIR);
  const invalidFiles = files.filter((file) => !MIGRATION_FILE_REGEX.test(file));

  if (invalidFiles.length > 0) {
    throw new Error(`脚本命名不规范: ${invalidFiles.join(", ")}`);
  }
  return files;
}

function parseMigrationFileName(fileName: string): MigrationFileInfo {
  const match = fileName.match(MIGRATION_FILE_REGEX);
  if (!match) throw new Error(`File name format invalid: ${fileName}`);

  const [, version, name, orderStr] = match;
  return {
    filePath: join(SCRIPTS_DIR, fileName),
    fileName: fileName.replace(/\.ts$/, ""),
    version,
    name,
    order: parseInt(orderStr, 10),
  };
}

function sortMigrationFiles(files: MigrationFileInfo[]): MigrationFileInfo[] {
  return files.sort((a, b) => {
    const versionCompare = semver.compare(a.version, b.version);
    return versionCompare !== 0 ? versionCompare : a.order - b.order;
  });
}

async function getExecutedMigrations(connection: Connection): Promise<string[]> {
  const db = connection.db;
  if (!db) throw new Error("Database not available");

  const collections = await db.listCollections({ name: MIGRATION_COLLECTION }).toArray();
  if (collections.length === 0) return [];

  const records = await db.collection<MigrationRecord>(MIGRATION_COLLECTION).find().toArray();
  return records.map((r) => r.fileName);
}

function validateMigrationIntegrity(
  sortedFiles: MigrationFileInfo[],
  executedFileNames: string[],
): void {
  const allFileNames = new Set(sortedFiles.map((f) => f.fileName));
  const executedSet = new Set(executedFileNames);

  // 检查已执行的脚本是否存在
  const missing = executedFileNames.filter((name) => !allFileNames.has(name));
  if (missing.length > 0) {
    throw new Error(`已执行的脚本不存在: ${missing.join(", ")}`);
  }

  // 检查顺序是否连续
  let foundPending = false;
  for (const file of sortedFiles) {
    const isExecuted = executedSet.has(file.fileName);
    if (foundPending && isExecuted) {
      throw new Error(`顺序不连续: ${file.fileName} 已执行，但之前有未执行的脚本`);
    }
    if (!isExecuted) foundPending = true;
  }
}

async function recordMigration(connection: Connection, fileInfo: MigrationFileInfo): Promise<void> {
  const db = connection.db;
  if (!db) throw new Error("Database not available");

  await db.collection<MigrationRecord>(MIGRATION_COLLECTION).insertOne({
    fileName: fileInfo.fileName,
    version: fileInfo.version,
    order: fileInfo.order,
    name: fileInfo.name,
    migratedAt: new Date(),
  });
}

async function removeMigrationRecord(connection: Connection, fileName: string): Promise<void> {
  const db = connection.db;
  if (!db) throw new Error("Database not available");

  await db.collection<MigrationRecord>(MIGRATION_COLLECTION).deleteOne({ fileName });
}

async function loadMigration(
  connection: Connection,
  fileInfo: MigrationFileInfo,
): Promise<AbstractMigration> {
  const module = (await import(fileInfo.filePath)) as {
    default: new (connection: Connection) => AbstractMigration;
  };
  return new module.default(connection);
}

async function executeMigration(
  connection: Connection,
  fileInfo: MigrationFileInfo,
): Promise<void> {
  const migration = await loadMigration(connection, fileInfo);
  await migration.up();
  await recordMigration(connection, fileInfo);
  log(`${PREFIX} ${chalk.green("✓")} ${chalk.cyan(fileInfo.fileName)}`);
}

async function rollbackMigration(
  connection: Connection,
  fileInfo: MigrationFileInfo,
): Promise<void> {
  log(`${PREFIX} ${chalk.yellow("↩")} 回滚 ${chalk.cyan(fileInfo.fileName)}`);
  const migration = await loadMigration(connection, fileInfo);
  await migration.down();
  await removeMigrationRecord(connection, fileInfo.fileName);
  log(`${PREFIX} ${chalk.yellow("✓")} 回滚完成 ${chalk.cyan(fileInfo.fileName)}`);
}

async function rollbackAll(
  connection: Connection,
  executedInThisRun: MigrationFileInfo[],
): Promise<void> {
  if (executedInThisRun.length === 0) return;

  log(`${PREFIX} ${chalk.red("开始回滚本次执行的迁移...")}`);

  // 逆序回滚
  for (let i = executedInThisRun.length - 1; i >= 0; i--) {
    try {
      await rollbackMigration(connection, executedInThisRun[i]);
    } catch (rollbackErr) {
      error(`${PREFIX} ${chalk.red("回滚失败:")} ${executedInThisRun[i].fileName}`, rollbackErr);
      // 继续回滚其他的
    }
  }
}

async function main(): Promise<void> {
  const connection = await connectMongo();
  const executedInThisRun: MigrationFileInfo[] = [];

  try {
    const files = await scanMigrationFiles();
    const sortedFiles = sortMigrationFiles(files.map(parseMigrationFileName));

    const executedFileNames = await getExecutedMigrations(connection);
    validateMigrationIntegrity(sortedFiles, executedFileNames);

    const executedSet = new Set(executedFileNames);
    const pending = sortedFiles.filter((f) => !executedSet.has(f.fileName));

    log(
      `${PREFIX} 总计 ${chalk.yellow(sortedFiles.length)} 个, 已执行 ${chalk.green(executedFileNames.length)} 个, 待执行 ${chalk.cyan(pending.length)} 个`,
    );

    if (pending.length === 0) return;

    for (const fileInfo of pending) {
      await executeMigration(connection, fileInfo);
      executedInThisRun.push(fileInfo);
    }

    log(`${PREFIX} ${chalk.green("全部完成")}`);
  } catch (err) {
    error(`${PREFIX} ${chalk.red("执行失败:")}`, err);
    await rollbackAll(connection, executedInThisRun);
    throw err;
  } finally {
    await mongoose.disconnect();
  }
}

main()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

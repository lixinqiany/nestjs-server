/**
 * 迁移文件信息
 */
export interface MigrationFileInfo {
  /** 完整文件路径 */
  filePath: string;
  /** 文件名（不含扩展名） */
  fileName: string;
  /** 版本号，如 "0.0.0" */
  version: string;
  /** 迁移名称，如 "create-migration" */
  name: string;
  /** 执行顺序，如 1 */
  order: number;
}

/**
 * 迁移记录（存储在数据库中）
 */
export interface MigrationRecord {
  fileName: string;
  version: string;
  order: number;
  name: string;
  migratedAt: Date;
}

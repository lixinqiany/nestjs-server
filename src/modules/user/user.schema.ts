import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Role } from "./role.enum";

export type UserDocument = User & Document;

@Schema({
  /** @description 自动添加和维护 createdAt 和 updatedAt 字段 */
  timestamps: true,
  /** @description 指定数据库中的集合名称为 'users'。默认情况下，Mongoose 会把类名变小写并加 's' */
  collection: "users",
})
export class User {
  /** @description 用户名，唯一标识符 */
  @Prop({ required: true, unique: true })
  username: string;

  /** @description 经过加密后的密码哈希值 */
  @Prop({ required: true })
  password: string;

  /** @description 手机号 */
  @Prop({ required: true, unique: true })
  mobilePhone: string;

  /**
   * @description 用户的邮箱地址
   * 重要：如果不加 sparse: true，MongoDB 会把所有 email 为 null 的文档视为“重复的 null”，导致第二个不填邮箱的用户无法注册。
   * sparse 告诉数据库只对“有值”的字段进行唯一性检查。
   */
  @Prop({ required: false, unique: true, sparse: true })
  email?: string;

  /** @description 用于存储加密后的 Refresh Token */
  @Prop({ default: null })
  refreshToken: string;

  /** @description 用户的权限角色 */
  @Prop({ type: [String], enum: Role, default: [Role.USER] })
  roles: Role[];

  /** @description 账号是否激活可用 */
  @Prop({ default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import bcrypt from "bcrypt";
import { User, UserDocument } from "./user.schema";
import { CreateUserDto, LoginUserDto } from "../../dto/request/user.dto";
import { throwErrorIfDuplicated } from "#/utils/mongo-error.helper";
import { MongoServerError } from "mongodb";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly logger: Logger,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const { username, password, mobilePhone, email, roles } = createUserDto;

    /**
     * bcrypt做hash时候会自动加salt进行加密，防止彩虹表攻击
     * bcrypt.hash的方法重载如果第二个参数是number，会识别为salt rounds，会自动使用随机生成的salt
     * 等价于 （第二个参数是string，识别为salt）
     * const salt = await bcrypt.genSalt(10);
     * const hashedPassword = await bcrypt.hash(password, salt);
     */
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new this.userModel({
      username,
      password: hashedPassword,
      mobilePhone,
      email,
      roles,
    });

    try {
      const result = await user.save();
      this.logger.log(`成功创建用户: ${result.username}`, "UserService");
      return result;
    } catch (error) {
      if (error instanceof MongoServerError) {
        throwErrorIfDuplicated(error, this.logger);
      }
      throw error;
    }
  }

  async validateUser(loginUserDto: LoginUserDto): Promise<UserDocument> {
    const { username, password } = loginUserDto;

    const user = await this.userModel.findOne({ username });
    if (!user) {
      this.logger.warn(`登录失败: 用户 ${username} 不存在`, "UserService");
      throw new UnauthorizedException("用户不存在");
    }

    if (!user.isActive) {
      this.logger.warn(`登录失败: 用户 ${username} 已被禁用`, "UserService");
      throw new UnauthorizedException("账号已被禁用");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      this.logger.warn(`登录失败: 用户 ${username} 密码错误`, "UserService");
      throw new UnauthorizedException("密码错误");
    }

    this.logger.log(`用户 ${username} 登录成功`, "UserService");
    return user;
  }

  async login(loginUserDto: LoginUserDto): Promise<UserDocument> {
    return await this.validateUser(loginUserDto);
  }
}

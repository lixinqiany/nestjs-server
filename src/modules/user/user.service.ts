import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import bcrypt from "bcrypt";
import { User, UserDocument } from "./user.schema";
import { CreateUserDto } from "../../dto/request/user.dto";

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
    return user.save();
  }
}

import { Body, Controller, Post } from "@nestjs/common";
import { CreateUserDto } from "../../dto/request/user.dto";
import { UserEntityVo } from "../../dto/response/user.dto";
import { UserService } from "./user.service";
import { type UserDocument } from "./user.schema";

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("sign-up")
  async register(@Body() createUserDto: CreateUserDto): Promise<UserEntityVo> {
    const user = await this.userService.create(createUserDto);
    return this.toUserEntityVo(user);
  }

  private toUserEntityVo(user: UserDocument): UserEntityVo {
    return {
      userId: user._id.toString(),
      username: user.username,
      mobilePhone: user.mobilePhone,
      email: user.email,
      roles: user.roles,
      isActive: user.isActive,
    };
  }
}

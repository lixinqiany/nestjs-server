import { Body, Controller, Post } from "@nestjs/common";
import { CreateUserDto } from "../../dto/request/create-user.dto";

@Controller()
export class UserController {
  //   constructor(private readonly userService: UserService) {}

  @Post("sign-up")
  async register(@Body() createUserDto: CreateUserDto) {}
}

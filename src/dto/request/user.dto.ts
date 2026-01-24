import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsEnum } from "class-validator";
import { Role } from "../../modules/user/role.enum";

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: "username is missing" })
  username: string;

  @IsString()
  @MinLength(6, { message: "password is too short. Please enter at least 6 characters" })
  password: string;

  @IsString()
  @IsNotEmpty({ message: "mobilePhone is missing" })
  mobilePhone: string;

  @IsEmail({}, { message: "email is not valid" })
  @IsOptional()
  email?: string;

  @IsEnum(Role, { each: true, message: "role is not valid" })
  @IsOptional()
  roles?: Role[];
}

import type { Role } from "../../modules/user/role.enum";

export class UserEntityVo {
  userId: string;
  username: string;
  mobilePhone: string;
  email?: string;
  roles: Role[];
  isActive: boolean;
}

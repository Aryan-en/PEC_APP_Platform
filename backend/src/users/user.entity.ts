import { Role } from '../roles/role.enum';

export class User {
  id: string;
  email: string;
  password: string;
  role: Role;
  isActive: boolean;
}

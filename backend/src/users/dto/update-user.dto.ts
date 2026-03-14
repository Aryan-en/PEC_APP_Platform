import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { Role } from '../../roles/role.enum';

export class UpdateUserDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}

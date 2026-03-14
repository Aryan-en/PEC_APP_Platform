import { IsNotEmpty, IsString } from 'class-validator';

export class DepartmentRowDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}

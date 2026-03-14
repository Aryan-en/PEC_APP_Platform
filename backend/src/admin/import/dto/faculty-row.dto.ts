import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class FacultyRowDto {
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  departmentCode: string;
}

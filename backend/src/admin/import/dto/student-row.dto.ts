import { IsEmail, IsString, Length } from 'class-validator';

export class StudentRowDto {
  @IsString()
  @Length(2, 20)
  rollNumber: string;

  @IsString()
  @Length(3, 100)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(2, 10)
  departmentCode: string;

  @IsString()
  batch: string;

  @IsString()
  semester: string;
}

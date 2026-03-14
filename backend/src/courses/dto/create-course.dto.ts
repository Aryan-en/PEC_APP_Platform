import {
  IsString,
  IsInt,
  IsOptional,
  IsUUID,
  Min,
  Max,
  Length,
} from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @Length(2, 20)
  code: string;

  @IsString()
  @Length(3, 100)
  name: string;

  @IsInt()
  @Min(1)
  @Max(8)
  semester: number;

  @IsInt()
  @Min(1)
  @Max(10)
  credits: number;

  @IsUUID()
  departmentId: string;

  @IsOptional()
  @IsUUID()
  facultyId?: string;
}

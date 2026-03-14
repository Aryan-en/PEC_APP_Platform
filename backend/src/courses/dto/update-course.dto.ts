import {
  IsString,
  IsInt,
  IsOptional,
  IsUUID,
  Min,
  Max,
  Length,
} from 'class-validator';

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  @Length(2, 20)
  code?: string;

  @IsOptional()
  @IsString()
  @Length(3, 100)
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(8)
  semester?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  credits?: number;

  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @IsOptional()
  @IsUUID()
  facultyId?: string;
}

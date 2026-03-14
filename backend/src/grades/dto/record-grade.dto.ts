import { IsString, IsUUID, MaxLength } from 'class-validator';

export class RecordGradeDto {
  @IsUUID()
  studentId: string;

  @IsUUID()
  courseId: string;

  @IsString()
  @MaxLength(2)
  grade: string;
}

import { IsDateString, IsEnum, IsUUID } from 'class-validator';
import { AttendanceStatus } from '@prisma/client';

export class MarkAttendanceDto {
  @IsUUID()
  studentId: string;

  @IsUUID()
  courseId: string;

  @IsDateString()
  date: string;

  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;
}

import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return 'Unknown error';
  }

  async markAttendance(dto: MarkAttendanceDto) {
    const { studentId, courseId, date, status } = dto;
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    try {
      return await this.prisma.attendance.upsert({
        where: {
          studentId_courseId_date: {
            studentId,
            courseId,
            date: attendanceDate,
          },
        },
        update: { status },
        create: {
          studentId,
          courseId,
          date: attendanceDate,
          status,
        },
      });
    } catch (error) {
      throw new ConflictException(
        'Could not mark attendance: ' + this.getErrorMessage(error),
      );
    }
  }

  async getAttendanceByStudent(studentId: string) {
    return this.prisma.attendance.findMany({
      where: { studentId },
      include: {
        course: {
          select: { name: true, code: true },
        },
      },
    });
  }

  async getAttendanceByCourse(courseId: string) {
    return this.prisma.attendance.findMany({
      where: { courseId },
      include: {
        student: {
          select: { name: true, rollNumber: true },
        },
      },
    });
  }
}

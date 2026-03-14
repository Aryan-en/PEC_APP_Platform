import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RecordGradeDto } from './dto/record-grade.dto';

@Injectable()
export class GradesService {
  constructor(private prisma: PrismaService) {}

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return 'Unknown error';
  }

  async recordGrade(dto: RecordGradeDto) {
    const { studentId, courseId, grade } = dto;

    try {
      return await this.prisma.grade.upsert({
        where: {
          studentId_courseId: {
            studentId,
            courseId,
          },
        },
        update: { grade },
        create: {
          studentId,
          courseId,
          grade,
        },
      });
    } catch (error) {
      throw new ConflictException(
        'Could not record grade: ' + this.getErrorMessage(error),
      );
    }
  }

  async getStudentGrades(studentId: string) {
    return this.prisma.grade.findMany({
      where: { studentId },
      include: {
        course: {
          select: { name: true, code: true, credits: true },
        },
      },
    });
  }

  async getCourseGrades(courseId: string) {
    return this.prisma.grade.findMany({
      where: { courseId },
      include: {
        student: {
          select: { name: true, rollNumber: true },
        },
      },
    });
  }
}

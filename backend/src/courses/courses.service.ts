import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCourseDto) {
    return this.prisma.course.create({
      data: dto,
      include: {
        department: { select: { name: true, code: true } },
        faculty: { select: { name: true, employeeId: true } },
      },
    });
  }

  async findAll() {
    return this.prisma.course.findMany({
      include: {
        department: { select: { name: true, code: true } },
        faculty: { select: { name: true, employeeId: true } },
        _count: { select: { enrollments: true } },
      },
    });
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        department: { select: { name: true, code: true } },
        faculty: { select: { name: true, employeeId: true } },
        enrollments: {
          include: {
            student: { select: { name: true, rollNumber: true } },
          },
        },
      },
    });

    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async update(id: string, dto: UpdateCourseDto) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundException('Course not found');

    return this.prisma.course.update({
      where: { id },
      data: dto,
      include: {
        department: { select: { name: true, code: true } },
        faculty: { select: { name: true, employeeId: true } },
      },
    });
  }

  async remove(id: string) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundException('Course not found');

    await this.prisma.course.delete({ where: { id } });
    return { message: 'Course deleted successfully' };
  }
}

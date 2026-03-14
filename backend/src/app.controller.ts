import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private prisma: PrismaService) {}

  @Get()
  getRoot() {
    return {
      name: 'PEC Portal API',
      version: '1.0.0',
      status: 'running',
      docs: '/api/docs',
      endpoints: {
        health: '/api/health',
        auth: '/api/auth',
        users: '/api/users',
        courses: '/api/courses',
        enrollments: '/api/enrollments',
        attendance: '/api/attendance',
        grades: '/api/grades',
        admin: '/api/admin',
      },
    };
  }

  @Get('health')
  async health() {
    await this.prisma.$queryRaw`SELECT 1`;
    return {
      status: 'OK',
      database: 'Connected',
      timestamp: new Date(),
    };
  }
}

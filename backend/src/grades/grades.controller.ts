import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { GradesService } from './grades.service';
import { RecordGradeDto } from './dto/record-grade.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { Role } from '../roles/role.enum';

@Controller('grades')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Post('record')
  @Roles(Role.FACULTY, Role.ADMIN)
  async recordGrade(@Body() dto: RecordGradeDto) {
    return this.gradesService.recordGrade(dto);
  }

  @Get('student/:id')
  async getStudentGrades(@Param('id') id: string) {
    return this.gradesService.getStudentGrades(id);
  }

  @Get('course/:id')
  @Roles(Role.FACULTY, Role.ADMIN)
  async getCourseGrades(@Param('id') id: string) {
    return this.gradesService.getCourseGrades(id);
  }
}

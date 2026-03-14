import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { Role } from '../roles/role.enum';

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('mark')
  @Roles(Role.FACULTY, Role.ADMIN)
  async markAttendance(@Body() dto: MarkAttendanceDto) {
    return this.attendanceService.markAttendance(dto);
  }

  @Get('student/:id')
  async getStudentAttendance(@Param('id') id: string) {
    return this.attendanceService.getAttendanceByStudent(id);
  }

  @Get('course/:id')
  @Roles(Role.FACULTY, Role.ADMIN)
  async getCourseAttendance(@Param('id') id: string) {
    return this.attendanceService.getAttendanceByCourse(id);
  }
}

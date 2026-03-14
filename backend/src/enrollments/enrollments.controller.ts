import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { Role } from '../roles/role.enum';

@Controller('enrollments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.FACULTY)
  async create(@Body() dto: CreateEnrollmentDto) {
    return this.enrollmentsService.create(dto);
  }

  @Get('student/:id')
  async findByStudent(@Param('id') id: string) {
    return this.enrollmentsService.findByStudent(id);
  }

  @Get('course/:id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.FACULTY)
  async findByCourse(@Param('id') id: string) {
    return this.enrollmentsService.findByCourse(id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async remove(@Param('id') id: string) {
    return this.enrollmentsService.remove(id);
  }
}

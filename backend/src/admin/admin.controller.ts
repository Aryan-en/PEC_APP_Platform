import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DepartmentsImportService } from './import/departments-import.service';
import { FacultyImportService } from './import/faculty-import.service';
import { StudentImportService } from './import/student-import.service';
import { Roles } from '../roles/roles.decorator';
import { Role } from '../roles/role.enum';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../roles/roles.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
export class AdminController {
  constructor(
    private readonly departmentsImportService: DepartmentsImportService,
    private readonly facultyImportService: FacultyImportService,
    private readonly studentImportService: StudentImportService,
  ) {}

  @Post('import/departments')
  @UseInterceptors(FileInterceptor('file'))
  async importDepartments(@UploadedFile() file: Express.Multer.File) {
    if (!file)
      throw new BadRequestException(
        'CSV file is required. Upload a file with field name "file".',
      );
    return this.departmentsImportService.importCSV(file.buffer);
  }

  @Post('import/faculty')
  @UseInterceptors(FileInterceptor('file'))
  async importFaculty(@UploadedFile() file: Express.Multer.File) {
    if (!file)
      throw new BadRequestException(
        'CSV file is required. Upload a file with field name "file".',
      );
    return this.facultyImportService.importCSV(file.buffer);
  }

  @Post('import/students')
  @UseInterceptors(FileInterceptor('file'))
  async importStudents(@UploadedFile() file: Express.Multer.File) {
    if (!file)
      throw new BadRequestException(
        'CSV file is required. Upload a file with field name "file".',
      );
    return this.studentImportService.importCSV(file.buffer);
  }
}

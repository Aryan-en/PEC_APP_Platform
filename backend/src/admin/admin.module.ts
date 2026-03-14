import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { DepartmentsImportService } from './import/departments-import.service';
import { FacultyImportService } from './import/faculty-import.service';
import { StudentImportService } from './import/student-import.service';

@Module({
  controllers: [AdminController],
  providers: [
    DepartmentsImportService,
    FacultyImportService,
    StudentImportService,
  ],
})
export class AdminModule {}

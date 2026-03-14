import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BaseImportService, ImportError } from './base-import.service';
import { FacultyRowDto } from './dto/faculty-row.dto';
import * as bcrypt from 'bcrypt';
import { Role } from '../../roles/role.enum';

@Injectable()
export class FacultyImportService extends BaseImportService<FacultyRowDto> {
  protected dtoClass = FacultyRowDto;

  constructor(private prisma: PrismaService) {
    super();
  }

  protected async validateDomainConstraints(
    dto: FacultyRowDto,
    rowNumber: number,
  ): Promise<ImportError | null> {
    const department = await this.prisma.department.findUnique({
      where: { code: dto.departmentCode },
    });

    if (!department) {
      return {
        row: rowNumber,
        errors: [`Department ${dto.departmentCode} does not exist`],
      };
    }

    return null;
  }

  protected async processEntries(entries: FacultyRowDto[]): Promise<number> {
    for (const row of entries) {
      const password = await bcrypt.hash(row.employeeId, 10);

      await this.prisma.$transaction(async (tx) => {
        const department = await tx.department.findUniqueOrThrow({
          where: { code: row.departmentCode },
        });

        const user = await tx.user.upsert({
          where: { email: row.email },
          update: {},
          create: {
            email: row.email,
            password,
            role: Role.FACULTY,
          },
        });

        await tx.faculty.upsert({
          where: { employeeId: row.employeeId },
          update: {
            name: row.name,
            departmentId: department.id,
          },
          create: {
            employeeId: row.employeeId,
            name: row.name,
            userId: user.id,
            departmentId: department.id,
          },
        });
      });
    }

    return entries.length;
  }
}

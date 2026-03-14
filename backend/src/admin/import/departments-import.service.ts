import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BaseImportService } from './base-import.service';
import { DepartmentRowDto } from './dto/departments-row.dto';

@Injectable()
export class DepartmentsImportService extends BaseImportService<DepartmentRowDto> {
  protected dtoClass = DepartmentRowDto;

  constructor(private prisma: PrismaService) {
    super();
  }

  protected async processEntries(entries: DepartmentRowDto[]): Promise<number> {
    await this.prisma.$transaction(
      entries.map((row) =>
        this.prisma.department.upsert({
          where: { code: row.code },
          update: { name: row.name },
          create: {
            code: row.code,
            name: row.name,
          },
        }),
      ),
    );

    return entries.length;
  }
}

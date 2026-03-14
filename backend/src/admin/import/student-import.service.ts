import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import csv from 'csv-parser';
import { Readable } from 'stream';
import { StudentRowDto } from './dto/student-row.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import * as bcrypt from 'bcrypt';
import { Role } from '../../roles/role.enum';

@Injectable()
export class StudentImportService {
  constructor(private prisma: PrismaService) {}

  async importCSV(fileBuffer: Buffer) {
    const rows: any[] = [];
    const errors: any[] = [];
    const validRows: StudentRowDto[] = [];

    // 1️⃣ Parse CSV
    await new Promise<void>((resolve, reject) => {
      Readable.from(fileBuffer)
        .pipe(csv())
        .on('data', (data) => rows.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    if (!rows.length) {
      return { status: 'failed', message: 'CSV file is empty' };
    }

    // 2️⃣ Validate rows
    for (let i = 0; i < rows.length; i++) {
      const rowNumber = i + 2;
      const dto = plainToInstance(StudentRowDto, rows[i]);
      const validationErrors = await validate(dto);

      if (validationErrors.length > 0) {
        errors.push({
          row: rowNumber,
          errors: validationErrors
            .map((e) => Object.values(e.constraints || {}))
            .flat(),
        });
        continue;
      }

      // Check department exists
      const department = await this.prisma.department.findUnique({
        where: { code: dto.departmentCode },
      });

      if (!department) {
        errors.push({
          row: rowNumber,
          errors: [`Department ${dto.departmentCode} does not exist`],
        });
        continue;
      }

      validRows.push(dto);
    }

    // 3️⃣ Stop if errors
    if (errors.length > 0) {
      return {
        status: 'validation_failed',
        totalRows: rows.length,
        validRows: validRows.length,
        invalidRows: errors.length,
        errors,
      };
    }

    // 4️⃣ Insert
    for (const row of validRows) {
      const password = await bcrypt.hash(row.rollNumber, 10);

      await this.prisma.$transaction(async (tx) => {
        const department = await tx.department.findUnique({
          where: { code: row.departmentCode },
        });

        if (!department) {
          throw new Error(`Department ${row.departmentCode} not found`);
        }

        const user = await tx.user.upsert({
          where: { email: row.email },
          update: {},
          create: {
            email: row.email,
            password,
            role: Role.STUDENT,
          },
        });

        await tx.student.upsert({
          where: { rollNumber: row.rollNumber },
          update: {
            name: row.name,
            batch: parseInt(row.batch, 10),
            semester: parseInt(row.semester, 10),
            departmentId: department.id,
          },
          create: {
            rollNumber: row.rollNumber,
            name: row.name,
            batch: parseInt(row.batch, 10),
            semester: parseInt(row.semester, 10),
            userId: user.id,
            departmentId: department.id,
          },
        });
      });
    }

    return {
      status: 'success',
      insertedOrUpdated: validRows.length,
    };
  }
}

import { BadRequestException } from '@nestjs/common';
import csv from 'csv-parser';
import { Readable } from 'stream';
import { plainToInstance, ClassConstructor } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

export interface ImportError {
  row: number;
  errors: string[];
}

export interface ImportResult {
  status: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors?: ImportError[];
  insertedOrUpdated?: number;
  message?: string;
}

export abstract class BaseImportService<T extends object> {
  protected abstract dtoClass: ClassConstructor<T>;

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return 'Unknown error';
  }

  async importCSV(fileBuffer: Buffer): Promise<ImportResult> {
    const rawRows: any[] = [];
    const importErrors: ImportError[] = [];
    const validDtos: T[] = [];

    // 1. Parse CSV
    try {
      await new Promise<void>((resolve, reject) => {
        Readable.from(fileBuffer)
          .pipe(csv())
          .on('data', (data) => rawRows.push(data))
          .on('end', resolve)
          .on('error', reject);
      });
    } catch (error) {
      throw new BadRequestException(
        `Failed to parse CSV: ${this.getErrorMessage(error)}`,
      );
    }

    if (!rawRows.length) {
      throw new BadRequestException('CSV file is empty');
    }

    // 2. Map and Validate Basic Constraints
    for (let i = 0; i < rawRows.length; i++) {
      const rowNumber = i + 2; // header = line 1
      const dto = plainToInstance(this.dtoClass, rawRows[i]);
      const validationErrors = await validate(dto);

      if (validationErrors.length > 0) {
        importErrors.push({
          row: rowNumber,
          errors: this.formatErrors(validationErrors),
        });
      } else {
        // 3. Domain Specific Pre-Validation (Optional)
        const domainError = await this.validateDomainConstraints(
          dto,
          rowNumber,
        );
        if (domainError) {
          importErrors.push(domainError);
        } else {
          validDtos.push(dto);
        }
      }
    }

    // 4. Return preview if validation failed
    if (importErrors.length > 0) {
      return {
        status: 'validation_failed',
        totalRows: rawRows.length,
        validRows: validDtos.length,
        invalidRows: importErrors.length,
        errors: importErrors,
      };
    }

    // 5. Process Valid Rows
    const processedCount = await this.processEntries(validDtos);

    return {
      status: 'success',
      totalRows: rawRows.length,
      validRows: validDtos.length,
      invalidRows: 0,
      insertedOrUpdated: processedCount,
    };
  }

  protected abstract processEntries(entries: T[]): Promise<number>;

  protected validateDomainConstraints(
    dto: T,
    rowNumber: number,
  ): Promise<ImportError | null> {
    void dto;
    void rowNumber;
    return null; // Default implementation does nothing
  }

  private formatErrors(errors: ValidationError[]): string[] {
    return errors
      .map((e) => {
        if (e.constraints) return Object.values(e.constraints);
        if (e.children && e.children.length > 0)
          return this.formatErrors(e.children);
        return [];
      })
      .flat();
  }
}

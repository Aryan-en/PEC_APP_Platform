import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

function parseCSV(filePath: string): Record<string, string>[] {
  const content = fs.readFileSync(filePath, 'utf-8').trim();
  const lines = content
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = values[i] || ''));
    return row;
  });
}

async function main() {
  const dataDir = path.resolve(__dirname, '../../../data/seed');

  // ─── 1. Seed Admin User ───
  console.log('\n🔐 Seeding admin user...');
  const adminPassword = await bcrypt.hash('password123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@pec.edu' },
    update: {},
    create: {
      email: 'admin@pec.edu',
      password: adminPassword,
      role: Role.ADMIN,
    },
  });
  console.log('   ✅ admin@pec.edu / password123');

  // ─── 2. Seed Departments ───
  console.log('\n🏢 Seeding departments...');
  const deptRows = parseCSV(path.join(dataDir, 'departments.csv'));
  for (const row of deptRows) {
    const dept = await prisma.department.upsert({
      where: { code: row.code },
      update: { name: row.name },
      create: { code: row.code, name: row.name },
    });
    console.log(`   ✅ ${dept.code} — ${dept.name}`);
  }

  // ─── 3. Seed Faculty ───
  console.log('\n👨‍🏫 Seeding faculty...');
  const facultyRows = parseCSV(path.join(dataDir, 'faculty.csv'));
  for (const row of facultyRows) {
    const department = await prisma.department.findUnique({
      where: { code: row.departmentCode },
    });
    if (!department) {
      console.log(
        `   ❌ Skipping ${row.name}: department ${row.departmentCode} not found`,
      );
      continue;
    }

    const password = await bcrypt.hash(row.employeeId, 10);
    const user = await prisma.user.upsert({
      where: { email: row.email },
      update: {},
      create: {
        email: row.email,
        password,
        role: Role.FACULTY,
      },
    });

    await prisma.faculty.upsert({
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
    console.log(
      `   ✅ ${row.employeeId} — ${row.name} (${row.departmentCode})`,
    );
  }

  // ─── 4. Seed Students ───
  console.log('\n🎓 Seeding students...');
  const studentRows = parseCSV(path.join(dataDir, 'students.csv'));
  for (const row of studentRows) {
    const department = await prisma.department.findUnique({
      where: { code: row.departmentCode },
    });
    if (!department) {
      console.log(
        `   ❌ Skipping ${row.name}: department ${row.departmentCode} not found`,
      );
      continue;
    }

    const password = await bcrypt.hash(row.rollNumber, 10);
    const user = await prisma.user.upsert({
      where: { email: row.email },
      update: {},
      create: {
        email: row.email,
        password,
        role: Role.STUDENT,
      },
    });

    await prisma.student.upsert({
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
    console.log(
      `   ✅ ${row.rollNumber} — ${row.name} (${row.departmentCode})`,
    );
  }

  // ─── Summary ───
  const counts = {
    departments: await prisma.department.count(),
    users: await prisma.user.count(),
    faculty: await prisma.faculty.count(),
    students: await prisma.student.count(),
  };
  console.log('\n📊 Database Summary:');
  console.log(`   Departments: ${counts.departments}`);
  console.log(`   Users: ${counts.users}`);
  console.log(`   Faculty: ${counts.faculty}`);
  console.log(`   Students: ${counts.students}`);
  console.log('\n✅ Seeding complete!');

  await prisma.$disconnect();
}

void main().catch(async (e) => {
  console.error('❌ Seeding failed:', e);
  await prisma.$disconnect();
  process.exit(1);
});

import prisma from './client';

async function main() {
  await prisma.studentRequest.deleteMany({
    where: {
      OR: [
        { student: { email: { contains: 'teststudent' } } },
        { student: { email: { contains: 'workflow_student' } } },
        { title: { contains: 'Need Past Paper for Compiler Construction 2023' } },
      ],
    },
  });

  await prisma.resource.deleteMany({
    where: {
      OR: [
        { title: { contains: 'Introduction to Process Scheduling' } },
        { title: { contains: 'Operating Systems Midterm 2024 Solved Paper' } },
      ],
    },
  });

  await prisma.user.deleteMany({
    where: {
      OR: [
        { email: { contains: 'teststudent' } },
        { email: { contains: 'workflow_student' } },
      ],
    },
  });

  console.log('Database cleanly reset of test dummy data.');
  await prisma.$disconnect();
}

main();

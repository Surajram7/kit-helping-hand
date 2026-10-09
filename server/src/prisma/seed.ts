import prisma from './client';
import { hashPassword } from '../utils/auth';
import { config } from '../config';

async function main() {
  console.log('--- Initializing KIT Helping Hand Database ---');

  // 1. Ensure Platform Settings exist
  const existingSettings = await prisma.platformSettings.findUnique({
    where: { id: 'default' },
  });

  if (!existingSettings) {
    await prisma.platformSettings.create({
      data: {
        id: 'default',
        platformName: 'KIT Helping Hand',
        tagline: 'Your Academic Resources, All in One Place.',
        institutionName: 'Khanpur Institute of Technology',
        allowedFileTypes: 'pdf,docx,pptx,zip',
        maxFileSizeMb: config.maxFileSizeMb,
      },
    });
    console.log('✓ Initialized default institutional platform settings.');
  }

  // 2. Provision initial Super Administrator if no users exist
  const adminCount = await prisma.user.count({
    where: { role: 'SUPER_ADMIN' },
  });

  if (adminCount === 0) {
    const passwordHash = await hashPassword(config.initialAdminPassword);
    const admin = await prisma.user.create({
      data: {
        email: config.initialAdminEmail.toLowerCase(),
        fullName: config.initialAdminName,
        passwordHash,
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });

    console.log(`✓ Provisioned Initial Super Administrator:`);
    console.log(`  Email: ${admin.email}`);
    console.log(`  Role: ${admin.role}`);
    console.log(`  (Password defined in environment config: INITIAL_ADMIN_PASSWORD)`);
  } else {
    console.log('✓ Administrator account already exists. Skipping provisioning.');
  }

  console.log('✓ Database initialization complete with NO fabricated dummy academic data.');
}

main()
  .catch((e) => {
    console.error('Initialization error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

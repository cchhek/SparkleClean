const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create default Admin User
  const adminEmail = 'admin@cleaningservice.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'System Admin',
        role: 'ADMIN'
      }
    });
    console.log('Admin user created:', admin.email);
  } else {
    console.log('Admin user already exists');
  }

  // Create default Services
  const services = [
    {
      name: 'Regular House Cleaning',
      description: 'Routine cleaning service for maintaining a clean and comfortable home. Includes dusting, vacuuming, mopping, and basic kitchen & bathroom sanitization.',
      price: 120.0,
      duration: 120,
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=600'
    },
    {
      name: 'Deep Cleaning',
      description: 'A detailed cleaning service covering areas that require extra attention, such as baseboards, inside cabinets, and grout cleaning.',
      price: 200.0,
      duration: 240,
      image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&q=80&w=600'
    },
    {
      name: 'Office Cleaning',
      description: 'Professional cleaning services for workplaces and commercial areas to ensure a healthy environment for your employees.',
      price: 250.0,
      duration: 180,
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600'
    },
    {
      name: 'Move-In / Move-Out Cleaning',
      description: 'Comprehensive cleaning service for customers moving into or leaving a property. Restores the home to like-new condition.',
      price: 300.0,
      duration: 300,
      image: 'https://images.unsplash.com/photo-1603712449591-2f76db916b78?auto=format&fit=crop&q=80&w=600'
    }
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { id: service.name }, // Hacky but works if we search or check. Wait, name is not unique. Let's find first instead.
      update: {},
      create: service
    }).catch(async (e) => {
      // Just check if we can query by name
      const existing = await prisma.service.findFirst({
        where: { name: service.name }
      });
      if (!existing) {
        await prisma.service.create({ data: service });
      }
    });
  }
  console.log('Services seeded.');

  // Create default Addons
  const addons = [
    {
      name: 'Oven Cleaning',
      price: 50.0,
      description: 'Deep cleaning inside the oven to remove grease and burnt food.'
    },
    {
      name: 'Fridge Cleaning',
      price: 40.0,
      description: 'Thorough cleaning and sanitization inside the refrigerator.'
    },
    {
      name: 'Window Cleaning',
      price: 60.0,
      description: 'Interior window washing including sills and tracks.'
    }
  ];

  for (const addon of addons) {
    await prisma.addon.upsert({
      where: { name: addon.name },
      update: {},
      create: addon
    });
  }
  console.log('Addons seeded.');

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

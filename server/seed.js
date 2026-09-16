require('dotenv').config();
const connectDB = require('./config/db');
const seedData = require('./utils/seedData');

async function seed() {
  try {
    await connectDB();
    await seedData();

    console.log('\n🎉 Seed complete!');
    console.log('─────────────────────────');
    console.log('Admin Login:');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    console.log('─────────────────────────');
    console.log('Sample Participant Login:');
    console.log('  Name: Arun Kumar');
    console.log('  Roll Number: 26MCA101');
    console.log('─────────────────────────');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();

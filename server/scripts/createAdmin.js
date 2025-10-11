import 'dotenv/config.js';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import userModel from '../models/userModel.js';

async function main() {
  const {
    MONGODB_URL,
    JWT_SECRET 
  } = process.env;

  if (!MONGODB_URL) {
    console.error('❌ MONGODB_URL is missing in .env');
    process.exit(1);
  }
  if (!JWT_SECRET) {
    console.error('❌ JWT_SECRET is missing in .env');
    process.exit(1);
  }

  const DB = `${MONGODB_URL}/Pink-Aura-Salon-Management-System`;
  await mongoose.connect(DB);
  console.log('Connected to MongoDB');

  
  const name = process.env.SEED_ADMIN_NAME || 'Site Admin';
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const plainPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin!234';

  const password = await bcrypt.hash(plainPassword, 10);

  const upsert = await userModel.findOneAndUpdate(
    { email },
    {
      $set: {
        name,
        email,
        password,
        role: 'admin',
        status: 'active',
        jobTitle: '',             
        isAccountVerified: true,
      }
    },
    { new: true, upsert: true }
  );

  console.log(' Admin ready:');
  console.log({ id: upsert._id.toString(), email: upsert.email, role: upsert.role });
  await mongoose.disconnect();
  console.log('🔌 Disconnected');
  process.exit(0);
}

main().catch((e) => {
  console.error('❌ Failed:', e);
  process.exit(1);
});

const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (e) {}
require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../src/models/User.model');

async function seedOwner() {
  const email = process.env.OWNER_EMAIL;
  const password = process.env.OWNER_PASSWORD;
  const name = process.env.OWNER_NAME || 'Kishore';

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required');
  }

  if (!email || !password) {
    throw new Error('OWNER_EMAIL and OWNER_PASSWORD are required');
  }

  await mongoose.connect(process.env.MONGO_URI);

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.findOneAndUpdate(
    { email },
    { name, email, password: hashedPassword },
    { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
  );

  console.log(`Owner login ready for ${user.email}`);
  await mongoose.disconnect();
}

seedOwner().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect();
  process.exit(1);
});

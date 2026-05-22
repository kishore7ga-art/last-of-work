// server/src/scripts/createDefaultUser.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User.model');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    const email = process.env.OWNER_EMAIL || 'admin@example.com';
    const password = process.env.OWNER_PASSWORD || '1234567890';
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        name: 'Admin',
        email,
        password,
      });
      await user.save();
      console.log('✅ Default user created with password 1234567890');
    } else {
      // update password to the known default
      user.password = password;
      await user.save();
      console.log('✅ Default user password updated to 1234567890');
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating default user:', err);
    process.exit(1);
  }
})();

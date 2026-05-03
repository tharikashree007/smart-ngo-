const User = require('../models/User');

const seedAdmin = async () => {
  try {
    const existing = await User.findOne({ role: 'admin' });
    if (existing) {
      console.log('Admin already exists:', existing.email);
      return;
    }

    const admin = new User({
      name: 'Platform Admin',
      email: 'admin@ngoplatform.com',
      password: 'Admin@2024',
      role: 'admin',
    });

    await admin.save();
    console.log('✓ Admin account created');
    console.log('  Email   : admin@ngoplatform.com');
    console.log('  Password: Admin@2024');
  } catch (error) {
    console.error('Admin seed error:', error.message);
  }
};

module.exports = seedAdmin;

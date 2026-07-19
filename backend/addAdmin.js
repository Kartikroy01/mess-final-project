/**
 * Add Admin Script
 * 
 * One-time script to add or update an admin user.
 * Run from backend directory: node addAdmin.js
 * 
 * Environment Variables:
 * - ADMIN_NAME: Full name of the admin
 * - ADMIN_EMAIL: Email address
 * - ADMIN_PASSWORD: Password (min 6 characters)
 * - ADMIN_UPDATE: Set to 'true' to update existing admin
 * 
 * Example Usage:
 *   ADMIN_EMAIL=admin@nitj.ac.in node addAdmin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mess_management';
const name = process.env.ADMIN_NAME || 'System Admin';
const email = (process.env.ADMIN_EMAIL || 'admin@nitj.ac.in').toLowerCase().trim();
const password = process.env.ADMIN_PASSWORD || 'admin123';
const shouldUpdate = process.env.ADMIN_UPDATE === 'true';

async function run() {
  try {
    console.log('='.repeat(50));
    console.log('Admin Account Setup');
    console.log('='.repeat(50));

    if (password.length < 6) {
      console.error('❌ Password must be at least 6 characters long');
      process.exit(1);
    }

    console.log('\n📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const existing = await Admin.findOne({ email });

    if (existing && !shouldUpdate) {
      console.log('\n⚠️  Admin already exists with this email:');
      console.log(`   Name: ${existing.name}`);
      console.log(`   Email: ${existing.email}`);
      console.log(`   Role: ${existing.role}`);
      console.log(`   Active: ${existing.isActive}`);
      console.log('\n💡 To update, set ADMIN_UPDATE=true');
      await mongoose.connection.close();
      process.exit(0);
    }

    if (existing && shouldUpdate) {
      console.log('\n🔄 Updating existing Admin account...');
      existing.name = name;
      existing.password = password;
      await existing.save();
      console.log('\n✅ Admin updated successfully:');
      console.log(`   ID: ${existing._id}`);
      console.log(`   Name: ${existing.name}`);
      console.log(`   Email: ${existing.email}`);
    } else {
      console.log('\n➕ Creating new Admin...');
      const admin = await Admin.create({
        name,
        email,
        password,
      });
      console.log('\n✅ Admin created successfully:');
      console.log(`   ID: ${admin._id}`);
      console.log(`   Name: ${admin.name}`);
      console.log(`   Email: ${admin.email}`);
    }

    await mongoose.connection.close();
    console.log('\n🔌 DB Connection closed.');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Setup Failed:', err.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

run();

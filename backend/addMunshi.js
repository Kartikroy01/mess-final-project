/**
 * One-time script to add a munshi user.
 * Run from backend: node addMunshi.js
 * Usage: set MUNSHI_NAME, MUNSHI_EMAIL, MUNSHI_PASSWORD, MUNSHI_HOSTEL in env or edit below.
 *
 * Example: MUNSHI_HOSTEL=BH-1 node addMunshi.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Munshi = require('./models/Munshi');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mess_management';
const name = process.env.MUNSHI_NAME || 'Munshi BH-1';
const email = (process.env.MUNSHI_EMAIL || 'munshi@bh1.mess').toLowerCase().trim();
const password = process.env.MUNSHI_PASSWORD || 'munshi123';
const hostel = process.env.MUNSHI_HOSTEL || 'BH-1';

async function run() {
  await mongoose.connect(MONGODB_URI);
  const existing = await Munshi.findOne({ email });
  if (existing) {
    console.log('Munshi already exists with email:', email);
    process.exit(0);
    return;
  }
  await Munshi.create({ name, email, password, hostel });
  console.log('Munshi created:', { name, email, hostel });
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

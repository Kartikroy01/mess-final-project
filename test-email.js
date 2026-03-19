const nodemailer = require('nodemailer');
const dns = require('dns');
require('dotenv').config({ path: './backend/.env' });

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  lookup: (hostname, options, callback) => {
    dns.lookup(hostname, { family: 4 }, callback);
  }
});

async function test() {
  console.log('Testing with:', process.env.EMAIL_USER);
  try {
    await transporter.verify();
    console.log('✅ Connection successful! Your credentials and network are working.');
    
    console.log('Sending test email...');
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'Test Email',
      text: 'If you see this, email sending works!'
    });
    console.log('✅ Test email sent successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

test();

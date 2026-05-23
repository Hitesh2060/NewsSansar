// test-email.js
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

async function testEmail() {
  console.log('📧 Testing Gmail Configuration...');
  console.log('Email User:', process.env.EMAIL_USER||'hiteshbhatt2060@gmail.com');
  console.log('Email Pass:', process.env.EMAIL_PASS ||'hnaq oyfk izrd lqmq' ? '✓ Set' : '✗ Missing');
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER||'hiteshbhatt2060@gmail.com',
     pass: process.env.EMAIL_PASS ||'hnaq oyfk izrd lqmq',
    },

  });
  
  try {
    // Verify connection
    await transporter.verify();
    console.log('✅ Gmail connection successful!');
    
    // Send test email
    const info = await transporter.sendMail({
      from: `"hiteshbhatt2060@gmail.com" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: 'Test Email from News Portal',
      text: 'If you receive this, email is working!',
    });
    
    console.log('✅ Test email sent!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testEmail();
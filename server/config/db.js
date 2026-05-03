const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      family: 4,
      tls: true,
      tlsAllowInvalidCertificates: true  // Add this for development
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ DB error: ${error.message}`);
    // Don't exit process, let server run without DB
    console.log('⚠️ Running without database connection');
  }
};

module.exports = connectDB;
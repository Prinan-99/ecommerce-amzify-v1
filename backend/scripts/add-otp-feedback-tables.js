import pool from '../config/database.js';

const addNewTables = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Adding OTP and Feedback tables...');

    // OTP verification table
    await client.query(`
      CREATE TABLE IF NOT EXISTS otp_verifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('verification', 'password_reset')),
        expires_at TIMESTAMP NOT NULL,
        is_used BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Customer feedback table
    await client.query(`
      CREATE TABLE IF NOT EXISTS customer_feedback (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
        customer_name VARCHAR(255),
        customer_email VARCHAR(255) NOT NULL,
        type VARCHAR(50) DEFAULT 'general' CHECK (type IN ('general', 'product', 'service', 'complaint', 'suggestion')),
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        message TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'responded', 'closed')),
        admin_response TEXT,
        responded_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Account deletion requests table
    await client.query(`
      CREATE TABLE IF NOT EXISTS account_deletion_requests (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        reason TEXT,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
        requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processed_at TIMESTAMP,
        processed_by UUID REFERENCES users(id)
      )
    `);

    // Create indexes
    await client.query('CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_verifications(email)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_verifications(expires_at)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_feedback_status ON customer_feedback(status)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_feedback_created ON customer_feedback(created_at)');

    console.log('✅ OTP and Feedback tables added successfully!');
    
  } catch (error) {
    console.error('❌ Adding tables failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Run migration
addNewTables()
  .then(() => {
    console.log('🎉 New tables added successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Adding tables failed:', error);
    process.exit(1);
  });
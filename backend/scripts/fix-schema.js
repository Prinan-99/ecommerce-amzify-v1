import pool from '../config/database.js';

const fixSchema = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Fixing database schema...');

    // Add missing columns to seller_profiles
    await client.query(`
      ALTER TABLE seller_profiles 
      ADD COLUMN IF NOT EXISTS business_address TEXT,
      ADD COLUMN IF NOT EXISTS city VARCHAR(100),
      ADD COLUMN IF NOT EXISTS state VARCHAR(100),
      ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20),
      ADD COLUMN IF NOT EXISTS gst_number VARCHAR(50),
      ADD COLUMN IF NOT EXISTS pan_number VARCHAR(50),
      ADD COLUMN IF NOT EXISTS bank_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS account_number VARCHAR(50),
      ADD COLUMN IF NOT EXISTS ifsc_code VARCHAR(20),
      ADD COLUMN IF NOT EXISTS account_holder_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,4) DEFAULT 0.15
    `);

    // Create shipments table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS shipments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
        tracking_number VARCHAR(100) UNIQUE NOT NULL,
        carrier VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned')),
        estimated_delivery TIMESTAMP,
        actual_delivery TIMESTAMP,
        shipping_address JSONB NOT NULL,
        weight DECIMAL(8,2),
        dimensions JSONB,
        cost DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create tracking_events table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS tracking_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL,
        description TEXT,
        location VARCHAR(255),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Schema fixed successfully!');
    
  } catch (error) {
    console.error('❌ Schema fix failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Run schema fix
fixSchema()
  .then(() => {
    console.log('🎉 Schema update completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Schema fix failed:', error);
    process.exit(1);
  });
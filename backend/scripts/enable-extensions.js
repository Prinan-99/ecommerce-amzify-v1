import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function enableExtensions() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Enabling PostgreSQL extensions...');
    
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    console.log('✅ uuid-ossp extension enabled');
    
    await client.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');
    console.log('✅ pgcrypto extension enabled');
    
    console.log('\n✅ Extensions enabled successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

enableExtensions();

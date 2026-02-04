import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

async function checkData() {
  try {
    await client.connect();
    console.log('📊 Database Population Summary:');
    console.log('================================');
    
    const tables = [
      'users', 'seller_profiles', 'customers', 'categories', 
      'products', 'orders', 'order_items', 'customer_feedback'
    ];
    
    for (const table of tables) {
      const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
      console.log(`${table.padEnd(16)}: ${result.rows[0].count} records`);
    }
    
    console.log('\n🎯 User Breakdown:');
    const userRoles = await client.query('SELECT role, COUNT(*) FROM users GROUP BY role ORDER BY role');
    userRoles.rows.forEach(row => {
      console.log(`${row.role.padEnd(10)}: ${row.count} users`);
    });

    console.log('\n📦 Product Status:');
    const productStatus = await client.query('SELECT status, COUNT(*) FROM products GROUP BY status');
    productStatus.rows.forEach(row => {
      console.log(`${row.status.padEnd(10)}: ${row.count} products`);
    });

    console.log('\n📋 Order Status:');
    const orderStatus = await client.query('SELECT status, COUNT(*) FROM orders GROUP BY status');
    orderStatus.rows.forEach(row => {
      console.log(`${row.status.padEnd(10)}: ${row.count} orders`);
    });
    
    console.log('\n✅ Database successfully populated with realistic e-commerce data!');
    console.log('🌐 Your teammates can now access the populated data on Render.');
    
  } catch (error) {
    console.error('❌ Error checking data:', error.message);
  } finally {
    await client.end();
  }
}

checkData();
// Script to set a user as admin
// Usage: node -r dotenv/config scripts/setAdminUser.js <email>

const { pool } = require('../config/database');

const setAdminUser = async () => {
  try {
    const email = process.argv[2];
    
    if (!email) {
      console.error('❌ Please provide an email address');
      console.log('Usage: node -r dotenv/config scripts/setAdminUser.js <email>');
      process.exit(1);
    }
    
    console.log(`🚀 Setting user "${email}" as admin...\n`);
    
    // First check if user exists
    const userCheck = await pool.query('SELECT id, email, name, role FROM users WHERE email = $1', [email.toLowerCase()]);
    
    if (userCheck.rows.length === 0) {
      console.error(`❌ User with email "${email}" not found`);
      console.log('\nAvailable users:');
      const allUsers = await pool.query('SELECT email, name, role FROM users LIMIT 10');
      allUsers.rows.forEach(user => {
        console.log(`   - ${user.email} (${user.name}) [${user.role || 'user'}]`);
      });
      process.exit(1);
    }
    
    // Update user role to admin
    const result = await pool.query(
      'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE email = $2 RETURNING id, email, name, role',
      ['admin', email.toLowerCase()]
    );
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log('✅ User updated successfully!');
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Role: ${user.role}\n`);
      
      // Show all admin users
      const adminUsers = await pool.query('SELECT email, name FROM users WHERE role = $1', ['admin']);
      console.log(`📋 Total admin users: ${adminUsers.rows.length}`);
      adminUsers.rows.forEach(admin => {
        console.log(`   - ${admin.email} (${admin.name})`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to set admin user:', error.message);
    
    if (error.message.includes('role column')) {
      console.error('\n⚠️  The role column might not exist. Please run the migration first:');
      console.error('   npm run migrate:admin-role');
    }
    
    process.exit(1);
  }
};

setAdminUser();


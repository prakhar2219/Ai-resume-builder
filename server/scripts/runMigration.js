// Script to run the admin role migration
// Usage: node -r dotenv/config scripts/runMigration.js

const { pool } = require('../config/database');
const fs = require('fs');
const path = require('path');

const runMigration = async () => {
  try {
    console.log('🚀 Running admin role migration...\n');
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '../config/migrations/add_role_to_users.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await pool.query(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    console.log('✅ Role column added to users table');
    console.log('✅ Index created on role column\n');
    
    // Verify the migration
    const result = await pool.query(`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'role'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Verification: Role column exists in users table');
      console.log('   Column details:', result.rows[0]);
    }
    
    // Show current admin users
    const adminUsers = await pool.query('SELECT email, name, role FROM users WHERE role = $1', ['admin']);
    if (adminUsers.rows.length > 0) {
      console.log('\n📋 Current admin users:');
      adminUsers.rows.forEach(user => {
        console.log(`   - ${user.email} (${user.name})`);
      });
    } else {
      console.log('\n⚠️  No admin users found. You need to set a user as admin:');
      console.log("   UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';");
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Migration already applied (this is OK)');
    }
    process.exit(1);
  }
};

runMigration();


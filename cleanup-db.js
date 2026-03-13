import pkg from 'pg';
const { Pool } = pkg;

const DATABASE_URL = "postgresql://counsellor_admin_db_user:DkwXHMlW3THKKn5ZkzWaIjFORuxUv9dP@dpg-d6pfrju3jp1c73cc8slg-a/counsellor_admin_db";

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function cleanOldData() {
  try {
    console.log("🔄 Connecting to database...");
    
    // Delete old users with NULL admin_id
    const usersResult = await pool.query("DELETE FROM users WHERE admin_id IS NULL");
    console.log(`✅ Deleted ${usersResult.rowCount} users with NULL admin_id`);
    
    // Delete old completed_users with NULL admin_id
    const completedResult = await pool.query("DELETE FROM completed_users WHERE admin_id IS NULL");
    console.log(`✅ Deleted ${completedResult.rowCount} completed_users with NULL admin_id`);
    
    // Delete old counsellors with NULL admin_id
    const counsellorsResult = await pool.query("DELETE FROM counsellors WHERE admin_id IS NULL");
    console.log(`✅ Deleted ${counsellorsResult.rowCount} counsellors with NULL admin_id`);
    
    // Show remaining data per admin
    const adminUsers = await pool.query(`
      SELECT admin_id, COUNT(*) as count 
      FROM users 
      GROUP BY admin_id
    `);
    
    console.log("\n📊 Remaining users by admin:");
    adminUsers.rows.forEach(row => {
      console.log(`   Admin ID ${row.admin_id}: ${row.count} users`);
    });
    
    console.log("\n✅ Database cleanup complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

cleanOldData();

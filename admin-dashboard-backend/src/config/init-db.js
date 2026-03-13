const pool = require("./database");

const initializeDatabase = async () => {
  try {
    console.log("📍 Initializing database tables...");

    // Create admin_users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Admin Users table created/verified");

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        risk_level VARCHAR(50) DEFAULT 'medium',
        plan_status VARCHAR(50) DEFAULT 'active',
        counsellor_id INTEGER,
        session_time VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Users table created/verified");

    // Create counsellors table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS counsellors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        specialty VARCHAR(100),
        availability VARCHAR(50),
        phone VARCHAR(20),
        status VARCHAR(50) DEFAULT 'active',
        assigned_users INTEGER DEFAULT 0,
        pending_reviews INTEGER DEFAULT 0,
        admin_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE
      );
    `);
    console.log("✅ Counsellors table created/verified");

    // Add status column if it doesn't exist (for existing databases)
    try {
      await pool.query(`
        ALTER TABLE counsellors ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
      `);
      console.log("✅ Counsellors status column verified");
    } catch (err) {
      // Column might already exist, silently continue
    }

    // Add assigned_users column if it doesn't exist
    try {
      await pool.query(`
        ALTER TABLE counsellors ADD COLUMN IF NOT EXISTS assigned_users INTEGER DEFAULT 0;
      `);
      console.log("✅ Counsellors assigned_users column verified");
    } catch (err) {
      // Column might already exist, silently continue
    }

    // Add pending_reviews column if it doesn't exist
    try {
      await pool.query(`
        ALTER TABLE counsellors ADD COLUMN IF NOT EXISTS pending_reviews INTEGER DEFAULT 0;
      `);
      console.log("✅ Counsellors pending_reviews column verified");
    } catch (err) {
      // Column might already exist, silently continue
    }

    // Add admin_id column if it doesn't exist
    try {
      await pool.query(`
        ALTER TABLE counsellors ADD COLUMN IF NOT EXISTS admin_id INTEGER;
      `);
      console.log("✅ Counsellors admin_id column verified");
    } catch (err) {
      // Column might already exist, silently continue
    }

    // Create completed_users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS completed_users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        risk_level VARCHAR(50) DEFAULT 'medium',
        plan_status VARCHAR(50) DEFAULT 'completed',
        counsellor_id INTEGER,
        session_time VARCHAR(100),
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Completed Users table created/verified");

    // Create index for foreign key
    await pool.query(`
      ALTER TABLE users
      ADD CONSTRAINT fk_counsellor
      FOREIGN KEY (counsellor_id) REFERENCES counsellors(id)
      ON DELETE SET NULL;
    `).catch(err => {
      if (err.message.includes("already exists")) {
        console.log("✅ Foreign key constraint already exists");
      } else {
        throw err;
      }
    });

    console.log("✅ Database initialization complete");
  } catch (error) {
    console.error("❌ Error initializing database:", error.message);
    throw error;
  }
};

module.exports = initializeDatabase;

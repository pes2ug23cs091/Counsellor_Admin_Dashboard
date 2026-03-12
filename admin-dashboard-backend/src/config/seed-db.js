const pool = require("./database");

const seedDatabase = async () => {
  try {
    console.log("🌱 Seeding database with sample data...");

    // Insert sample counsellors
    const counsellorResult = await pool.query(`
      INSERT INTO counsellors (name, email, specialty, availability, phone, status)
      VALUES
        ('Dr. Sarah Johnson', 'sarah.johnson@counselling.com', 'Depression & Anxiety', 'available', '+1-800-COUNSEL', 'active'),
        ('Dr. Michael Chen', 'michael.chen@counselling.com', 'Stress Management', 'available', '+1-800-COUNSEL', 'active'),
        ('Dr. Emily Rodriguez', 'emily.r@counselling.com', 'Life Coaching', 'available', '+1-800-COUNSEL', 'active'),
        ('Dr. James Wilson', 'james.w@counselling.com', 'Trauma Therapy', 'busy', '+1-800-COUNSEL', 'inactive'),
        ('Dr. Lisa Anderson', 'lisa.a@counselling.com', 'Relationship Counselling', 'available', '+1-800-COUNSEL', 'active')
      ON CONFLICT (email) DO NOTHING
      RETURNING id;
    `);

    console.log(`✅ Added ${counsellorResult.rows.length} counsellors`);

    // Get counsellor IDs
    const counsellors = await pool.query("SELECT id FROM counsellors LIMIT 5");
    const counsellorIds = counsellors.rows.map(c => c.id);

    // Insert sample users
    const userResult = await pool.query(`
      INSERT INTO users (name, email, risk_level, plan_status, counsellor_id, session_time)
      VALUES
        ('John Smith', 'john.smith@email.com', 'high', 'active', $1, 'Mondays 10 AM'),
        ('Alice Johnson', 'alice.j@email.com', 'medium', 'active', $2, 'Wednesdays 2 PM'),
        ('Bob Williams', 'bob.w@email.com', 'low', 'active', $3, 'Fridays 3 PM'),
        ('Diana Martinez', 'diana.m@email.com', 'high', 'pending', $4, 'Tuesdays 9 AM'),
        ('Edward Brown', 'edward.b@email.com', 'medium', 'active', $5, 'Thursdays 4 PM'),
        ('Fiona Davis', 'fiona.d@email.com', 'low', 'inactive', NULL, 'No session scheduled'),
        ('George Taylor', 'george.t@email.com', 'medium', 'active', $1, 'Mondays 3 PM'),
        ('Helen White', 'helen.w@email.com', 'high', 'active', $2, 'Wednesdays 11 AM')
      ON CONFLICT (email) DO NOTHING
      RETURNING id;
    `, counsellorIds);

    console.log(`✅ Added ${userResult.rows.length} users`);
    console.log("🌱 Database seeding complete!");

  } catch (error) {
    if (error.message.includes("already exists")) {
      console.log("✅ Data already seeded, skipping...");
    } else {
      console.error("❌ Error seeding database:", error.message);
    }
  }
};

module.exports = seedDatabase;

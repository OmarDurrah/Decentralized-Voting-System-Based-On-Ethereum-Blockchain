require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    const db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: 3306
    });

    console.log("✅ Connected to MySQL");

    // 2️⃣ Fetch all users
    const [users] = await db.execute("SELECT id, email, password FROM users");
    let updatedCount = 0;

    for (const user of users) {
      const { id, password } = user;

      // Skip already-hashed passwords (bcrypt hashes always start with $2)
      if (password.startsWith('$2')) {
        console.log(`🔒 User ID ${id} already has a hashed password — skipped.`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await db.execute("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, id]);
      console.log(`✅ Password for user ID ${id} hashed.`);
      updatedCount++;
    }

    console.log(`🎉 Done! ${updatedCount} password(s) updated.`);
    await db.end();
  } catch (err) {
    console.error("❌ Error during hashing process:", err);
  }
})();
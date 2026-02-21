const express = require("express");
const { Pool } = require("pg");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// 🔐 Ambil API Key dari Railway
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("❌ API_KEY is not set in environment variables!");
  process.exit(1);
}

// 🔌 Koneksi ke PostgreSQL Railway
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

/* ===================================================== */
/* ================= SERVE FRONTEND ==================== */

// Folder public untuk file HTML
app.use(express.static(path.join(__dirname, "public")));

/* ===================================================== */
/* ================= ROOT TEST ========================= */

app.get("/api", (req, res) => {
  res.send("R2J Flow API is running");
});

/* ===================================================== */
/* ================= UPDATE DATA ======================= */

app.get("/update", async (req, res) => {

  const { api_key, tinggi, status, water } = req.query;

  // 🔐 Wajib ada API key
  if (!api_key) {
    return res.status(401).send("API Key required");
  }

  // 🔐 Validasi API key
  if (api_key !== API_KEY) {
    return res.status(401).send("Unauthorized");
  }

  // Validasi parameter
  if (!tinggi || !status || !water) {
    return res.status(400).send("Missing parameters");
  }

  try {

    await pool.query(
      "INSERT INTO data_air (tinggi_air, status, water_level) VALUES ($1, $2, $3)",
      [tinggi, status, water]
    );

    res.send("OK");

  } catch (err) {

    console.error("Database Error:", err);
    res.status(500).send("Database error");
  }
});

/* ===================================================== */
/* ================= GET DATA TERBARU ================== */

app.get("/latest", async (req, res) => {

  try {

    const result = await pool.query(
      "SELECT * FROM data_air ORDER BY id DESC LIMIT 1"
    );

    if (result.rows.length === 0) {
      return res.json({ message: "No data yet" });
    }

    res.json(result.rows[0]);

  } catch (err) {

    console.error("Database Error:", err);
    res.status(500).send("Database error");
  }
});

/* ===================================================== */
/* ================= START SERVER ====================== */

app.listen(port, () => {
  console.log("🚀 Server running on port", port);
});

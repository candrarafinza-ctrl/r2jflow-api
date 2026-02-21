const express = require("express");
const { Pool } = require("pg");

const app = express();
const port = process.env.PORT || 3000;

// 🔐 Ambil API Key dari environment
const API_KEY = process.env.API_KEY;

// Validasi kalau API_KEY belum diset di Railway
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
/* ================= ROOT TEST ========================= */

app.get("/", (req, res) => {
  res.send("R2J Flow API is running");
});

/* ===================================================== */
/* ================= UPDATE DATA ======================= */

app.get("/update", async (req, res) => {

  const { api_key, tinggi, status, water } = req.query;

  // 🔐 WAJIB ADA API KEY
  if (!api_key) {
    return res.status(401).send("API Key required");
  }

  // 🔐 COCOKKAN API KEY
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

    res.json(result.rows[0] || { message: "No data yet" });

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

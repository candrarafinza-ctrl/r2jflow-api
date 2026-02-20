const express = require("express");
const { Pool } = require("pg");

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

app.get("/", (req, res) => {
  res.send("R2J Flow API is running");
});

app.get("/update", async (req, res) => {
  const { tinggi, status, water } = req.query;

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
    console.error(err);
    res.status(500).send("Database error");
  }
});

app.get("/latest", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM data_air ORDER BY id DESC LIMIT 1"
  );
  res.json(result.rows[0]);
});

app.listen(port, () => {
  console.log("Server running on port", port);
});

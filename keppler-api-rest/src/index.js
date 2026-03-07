const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();
const port = 9010;
app.use(cors({
  origin: [
    'http://localhost:4200',
    'http://localhost:9011',
    'https://keppler.ariassouto.es',
    'http://keppler.ariassouto.es'
  ]
}));

// Configuración de la base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.get('/satellites', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.sat_name, t.category, t.norad_cat_id, t.launch_year, t.intl_designator, 
             t.priority, t.owner, t.launch_site, t.ops_status, t.line1, t.line2, t.updated_at,
             i.intel_description, i.intel_image_url
      FROM tles t
      LEFT JOIN satellite_intel i ON t.sat_name = i.sat_name
      ORDER BY t.updated_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener datos de la DB' });
  }
});

// Endpoint para un satélite específico por nombre
app.get('/satellites/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const result = await pool.query(
      `SELECT t.*, i.intel_description, i.intel_image_url 
       FROM tles t 
       LEFT JOIN satellite_intel i ON t.sat_name = i.sat_name 
       WHERE t.sat_name ILIKE $1 
       ORDER BY t.updated_at DESC LIMIT 1`,
      [`%${name}%`]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Satélite no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

app.listen(port, () => {
  console.log(`Keppler-API escuchando en http://localhost:${port}`);
});
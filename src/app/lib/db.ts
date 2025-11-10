import { Pool } from 'pg';
import fs from 'fs';

const requiredEnvVars = [
  'POSTGRES_HOST',
  'POSTGRES_PORT',
  'POSTGRES_DB',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_CA_CERT'
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const ca = fs.readFileSync(process.env.POSTGRES_CA_CERT!).toString();

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT!, 10),
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  ssl: {
    ca,
    rejectUnauthorized: true
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  options: '-c timezone=Asia/Tokyo'
});

pool.on('connect', (client) => {
  client.query('SET timezone="Asia/Tokyo";');
});

export async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('Database connected successfully');
    client.release();
    return true;
  } catch (err: unknown) {
    console.error('Database connection error:', err);
    return false;
  }
}

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (err: unknown) {
    console.error('Error executing query:', err);
    throw err;
  }
}

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export async function saveSurvey(data: {
  photoType: string;
  rating: number;
  store: string;
  name: string;
  phone: string;
  visitDate: string;
  photoSatisfaction: string;
  otherStaffResponse: string;
  howFound: string[];
  importantFactors: string[];
  feedback: string;
  store_id: string;
  line_display_name?: string;
}) {
  const client = await pool.connect();
  try {
    const query = `
      INSERT INTO surveys.result (
        photo_type,
        rating,
        store,
        name,
        phone,
        visit_date,
        photo_satisfaction,
        other_staff_response,
        how_found,
        important_factors,
        feedback,
        store_id,
        line_display_name
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id
    `;

    const values = [
      data.photoType,
      data.rating,
      data.store,
      data.name,
      data.phone,
      data.visitDate,
      data.photoSatisfaction,
      data.otherStaffResponse,
      data.howFound,
      data.importantFactors,
      data.feedback,
      data.store_id,
      data.line_display_name || null
    ];

    const result = await client.query(query, values);
    return result.rows[0].id;
  } finally {
    client.release();
  }
}

export default pool;
import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // 允许跨域
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const { name, phone, address, shares, date, signature, timestamp } = req.body;

    // 创建表（如果不存在）
    await sql`
      CREATE TABLE IF NOT EXISTS contracts (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        shares INTEGER NOT NULL,
        date TEXT NOT NULL,
        signature TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 插入数据
    const result = await sql`
      INSERT INTO contracts (name, phone, address, shares, date, signature, timestamp)
      VALUES (${name}, ${phone}, ${address}, ${shares}, ${date}, ${signature}, ${timestamp})
      RETURNING id
    `;

    res.status(200).json({ success: true, id: result[0].id });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error', details: error.message });
  }
}

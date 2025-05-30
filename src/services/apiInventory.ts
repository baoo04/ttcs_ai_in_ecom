import type { NextApiRequest, NextApiResponse } from "next";
import mysql from "mysql2/promise";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT || 3306),
  });

  const [rows] = await connection.execute("SELECT * FROM your_table");

  await connection.end();

  res.status(200).json(rows);
}

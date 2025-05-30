import { db } from './fetchInventory';

export async function fetchInventoryData() {
  const [rows] = await db.query('SELECT * FROM inventory');
  return rows as unknown[];
}
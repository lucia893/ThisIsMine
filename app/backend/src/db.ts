import { Pool } from "pg";
import { config } from "./config";
import { Post, PostRow } from "./types";

const shouldUseSsl = !/localhost|127\.0\.0\.1/.test(config.databaseUrl);

export const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: shouldUseSsl ? { rejectUnauthorized: false } : false,
});

export function mapPostRow(row: PostRow): Post {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    image: row.image_url || undefined,
    location: row.location || "",
    datePosted: new Date(row.date_posted).toISOString(),
    contact: row.contact || "",
  };
}

export async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL CHECK (category IN ('lost', 'found')),
      image_url TEXT,
      image_key TEXT,
      location TEXT NOT NULL DEFAULT '',
      contact TEXT NOT NULL DEFAULT '',
      date_posted TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS posts_date_posted_idx
    ON posts (date_posted DESC);
  `);
}

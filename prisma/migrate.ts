import 'dotenv/config'
import pg from 'pg'

const { Pool } = pg

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  console.log('Connecting...')

  const client = await pool.connect()
  console.log('Connected! Running migration...')

  await client.query(`
    ALTER TABLE posts 
    ADD COLUMN IF NOT EXISTS "coverImage" TEXT,
    ADD COLUMN IF NOT EXISTS "category" TEXT NOT NULL DEFAULT 'General',
    ADD COLUMN IF NOT EXISTS "tags" TEXT[] NOT NULL DEFAULT '{}'
  `)

  console.log('Migration complete: added coverImage, category, tags to posts')
  client.release()
  await pool.end()
}

main().catch((e) => { console.error(e); process.exit(1) })

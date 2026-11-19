import { Pool } from 'pg'
import { readFile } from 'fs/promises'
import path from 'path'

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'wedding',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
})

let bootstrapPromise: Promise<void> | null = null

export async function bootstrapDatabase() {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      const schemaPath = path.join(process.cwd(), 'postgres', 'schema.sql')
      const sql = await readFile(schemaPath, 'utf8')
      await pool.query(sql)
    })().catch(error => {
      bootstrapPromise = null
      throw error
    })
  }
  return bootstrapPromise
}

export async function query<T = any>(text: string, params: any[] = []) {
  await bootstrapDatabase()
  return pool.query<T>(text, params)
}

export async function withTransaction<T>(fn: (client: any) => Promise<T>): Promise<T> {
  await bootstrapDatabase()
  const client = await pool.connect()
  try {
    await client.query('begin')
    const result = await fn(client)
    await client.query('commit')
    return result
  } catch (error) {
    await client.query('rollback')
    throw error
  } finally {
    client.release()
  }
}

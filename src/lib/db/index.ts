import {neon,neonConfig} from '@neondatabase/serverless'
import {} from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/neon-http'

neonConfig.fetchConnectionCache=true

// More deployment-safe database connection
let db: ReturnType<typeof drizzle>;

try {
  if(!process.env.DATABASE_URL){
    console.warn('DATABASE_URL is not set - database operations will fail gracefully')
    throw new Error('DATABASE_URL is not set')
  }

  const sql=neon(process.env.DATABASE_URL)
  db=drizzle(sql)
} catch (error) {
  console.error('Database connection error:', error)
  // Create a mock db object for build-time safety
  db = {} as ReturnType<typeof drizzle>
}

export { db }

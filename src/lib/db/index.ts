import {neon,neonConfig} from '@neondatabase/serverless'
import {} from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/neon-http'


neonConfig.fetchConnectionCache=true


if(!process.env.DATABASE_URL){
    throw new Error('DATABASE_URL is not set')
}

const sql=neon(process.env.DATABASE_URL)
export const db=drizzle(sql)

import { pgTable, serial, text, varchar, timestamp, pgEnum, integer } from 'drizzle-orm/pg-core';


export const userSystemEnum = pgEnum('user_system_enum', ['system', 'user']);

export const chats = pgTable('chats', {
  id: serial('id').primaryKey(),
  pdfName: text('pdf_name').notNull(),
  pdfUrl: text('pdf_url').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  userId: varchar('user_id', { length: 256 }).notNull(),
  fileKey: text('fileKey').notNull(),
});

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  chatId: integer('chat_id').notNull().references(() => chats.id),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  role: userSystemEnum('role').notNull(), 
});


// drizzle-orm
// drizzle-kit

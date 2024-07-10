import { sql } from "drizzle-orm";
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const admin = sqliteTable('admin', {
  username: text('username').primaryKey(),
  password: text('password').notNull(),
});

export const company = sqliteTable('company', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  company_name: text('company_name').notNull(),
  company_api_key: text('company_api_key').notNull(),
});

export const location = sqliteTable('location', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  company_id: integer('company_id').references(() => company.id),
  location_name: text('location_name').notNull(),
  location_country: text('location_country').notNull(),
  location_city: text('location_city').notNull(),
  location_meta: text('location_meta'),
});

export const sensor = sqliteTable('sensor', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  location_id: integer('location_id').references(() => location.id),
  sensor_name: text('sensor_name').notNull(),
  sensor_category: text('sensor_category').notNull(),
  sensor_api_key: text('sensor_api_key').notNull(),
  sensor_meta: text('sensor_meta'),
});

export const sensor_data = sqliteTable('sensordata', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sensor_id: integer('sensor_id').references(() => sensor.id),
  data: text('data', { mode: 'json'}).notNull(),
  timestamp: text('timestamp').default(sql`(CURRENT_TIMESTAMP)`),
});
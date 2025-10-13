import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

export const hospitals = sqliteTable('hospitals', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  hospitalId: text('hospital_id').notNull().unique(),
  name: text('name').notNull(),
  location: text('location').notNull(),
  capacityTotal: integer('capacity_total').notNull(),
  capacityCurrent: integer('capacity_current').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const snapshots = sqliteTable('snapshots', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  hospitalId: text('hospital_id').notNull().references(() => hospitals.hospitalId),
  timestamp: text('timestamp').notNull(),
  bedsTotal: integer('beds_total').notNull(),
  bedsFree: integer('beds_free').notNull(),
  doctorsOnShift: integer('doctors_on_shift').notNull(),
  nursesOnShift: integer('nurses_on_shift').notNull(),
  oxygenCylinders: integer('oxygen_cylinders').notNull(),
  ventilators: integer('ventilators').notNull(),
  medicines: text('medicines', { mode: 'json' }).notNull(),
  incomingEmergencies: integer('incoming_emergencies').notNull(),
  incidentDescription: text('incident_description'),
  aqi: integer('aqi'),
  festival: text('festival'),
  newsSummary: text('news_summary'),
  createdAt: text('created_at').notNull(),
});

export const predictions = sqliteTable('predictions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  snapshotId: integer('snapshot_id').notNull().references(() => snapshots.id),
  riskLevel: text('risk_level').notNull(),
  predictedAdditionalPatients6h: integer('predicted_additional_patients_6h').notNull(),
  recommendedActions: text('recommended_actions', { mode: 'json' }).notNull(),
  alertMessage: text('alert_message').notNull(),
  confidenceScore: real('confidence_score'),
  createdAt: text('created_at').notNull(),
});

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  role: text('role').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: text('created_at').notNull(),
});
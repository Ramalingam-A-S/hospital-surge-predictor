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


// Auth tables for better-auth
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  role: text("role").notNull().default("staff"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});
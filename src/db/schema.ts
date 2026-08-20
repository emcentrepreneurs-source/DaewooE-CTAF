import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

// Users table mapped to Firebase Auth UID
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  role: text('role').default('user'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Travelers table for TAF Records persistence
export const travelers = pgTable('travelers', {
  id: text('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  userUid: text('user_uid'),
  surname: text('surname').notNull(),
  nameGender: text('name_gender').notNull(),
  finalDestination: text('final_destination').notNull(),
  rotationType: text('rotation_type').notNull(),
  purposeOfTrip: text('purpose_of_trip'),
  companyId: text('company_id'),
  company: text('company'),
  position: text('position'),
  department: text('department'),
  mobileNumber: text('mobile_number'),
  emailAddress: text('email_address'),
  substituteInAbsence: text('substitute_in_absence'),
  frequentFlyerCard: text('frequent_flyer_card'),
  passportNumber: text('passport_number'),
  dateOfBirth: text('date_of_birth'),
  nationality: text('nationality'),
  passportExpiryDate: text('passport_expiry_date'),
  signatureDate: text('signature_date'),
  signatureName: text('signature_name'),
  signatureImage: text('signature_image'),
  flights: jsonb('flights').$type<any[]>(),
  accommodations: jsonb('accommodations').$type<any[]>(),
  status: text('status').default('ready'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// App settings table
export const appSettings = pgTable('app_settings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  defaultSignatureName: text('default_signature_name'),
  defaultSignatureDate: text('default_signature_date'),
  defaultSignatureImage: text('default_signature_image'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  travelers: many(travelers),
  settings: many(appSettings),
}));

export const travelersRelations = relations(travelers, ({ one }) => ({
  user: one(users, {
    fields: [travelers.userId],
    references: [users.id],
  }),
}));

export const appSettingsRelations = relations(appSettings, ({ one }) => ({
  user: one(users, {
    fields: [appSettings.userId],
    references: [users.id],
  }),
}));

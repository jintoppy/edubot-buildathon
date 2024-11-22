import { pgTable, uuid, text, timestamp, jsonb, boolean, real } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("student"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const studentProfiles = pgTable("student_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  currentEducation: text("current_education").notNull(),
  desiredLevel: text("desired_level").notNull(),
  preferredCountries: jsonb("preferred_countries").$type<string[]>(),
  testScores: jsonb("test_scores"),
  budgetRange: text("budget_range"),
  workExperience: jsonb("work_experience"),
  extraCurricular: jsonb("extra_curricular"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const programs = pgTable("programs", {
  id: uuid("id").primaryKey().defaultRandom(),
  universityId: uuid("university_id"),
  name: text("name").notNull(),
  level: text("level").notNull(),
  duration: text("duration").notNull(),
  tuitionFee: real("tuition_fee").notNull(),
  currency: text("currency").notNull(),
  country: text("country").notNull(),
  eligibilityCriteria: jsonb("eligibility_criteria"),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chatSessions = pgTable("chat_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id").references(() => users.id),
  sessionType: text("session_type").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  summary: text("summary"),
  recommendations: jsonb("recommendations"),
  sentimentScore: real("sentiment_score"),
  createdAt: timestamp("created_at").defaultNow(),
});
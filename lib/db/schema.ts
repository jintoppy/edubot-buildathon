import { pgTable, uuid, text, timestamp, jsonb, boolean, real, pgEnum } from "drizzle-orm/pg-core";

export const communicationModeEnum = pgEnum("communication_mode", [
  "video_only",    // Video and audio enabled
  "audio_only",    // Only audio enabled
  "text_only",     // Text-based communication only
  "multiple"       // Combination of modes (e.g., video + text)
]);

export const sessionCategoryEnum = pgEnum("session_category", [
  "initial_assessment",     // First counseling session
  "program_review",        // Specific program discussion
  "document_review",       // Review of student documents/applications
  "follow_up",            // Follow-up consultation
  "mock_interview",       // Interview preparation
  "general_query",        // General questions about programs/process
  "application_support",  // Help with application process
  "visa_guidance",        // Visa-related queries
  "scholarship_review",   // Scholarship-related discussion
  "test_preparation"      // Study/test preparation guidance
]);

export const messageTypeEnum = pgEnum("message_type", [
  "user_message",     // Message from the user
  "bot_message",      // Message from the AI bot
  "system_message",   // System notifications/updates
  "recommendation",   // Program recommendations
  "action_item"       // Tasks/actions for the user
]);

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
  
  // Communication type
  communicationMode: communicationModeEnum("communication_mode").notNull(),
  
  // Session categorization
  category: sessionCategoryEnum("session_category").notNull(),
  
  // Program reference (optional)
  programId: uuid("program_id").references(() => programs.id),
  
  // Session timing
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  
  // Session data
  summary: text("summary"),
  recommendations: jsonb("recommendations"),
  sentimentScore: real("sentiment_score"),
  
  // Session status
  status: text("status").notNull().default("active"), // active, completed, cancelled, scheduled
  
  // Metadata for additional properties
  metadata: jsonb("metadata"), // For storing session-specific data
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type CommunicationMode = typeof communicationModeEnum.enumValues;
export type SessionCategory = typeof sessionCategoryEnum.enumValues;
export type MessageType = typeof messageTypeEnum.enumValues;

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").references(() => chatSessions.id),
  userId: uuid("user_id").references(() => users.id),
  messageType: messageTypeEnum("message_type").notNull(),
  content: text("content").notNull(),
  metadata: jsonb("metadata"), // For storing additional message-specific data
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  isEdited: boolean("is_edited").default(false),
  editedAt: timestamp("edited_at"),
  programReferences: jsonb("program_references").$type<string[]>(), // Store referenced program IDs
  createdAt: timestamp("created_at").defaultNow(),
});
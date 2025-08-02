import { sql } from "drizzle-orm";
import { pgTable, text, varchar, json, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const quizzes = pgTable("quizzes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  content: json("content").notNull(), // Stores the original content analyzed
  analysis: json("analysis").notNull(), // Stores AI analysis results
  questions: json("questions").notNull(), // Stores generated questions
  questionCount: integer("question_count").notNull(),
  questionTypes: json("question_types").notNull(), // Array of question types
  createdAt: timestamp("created_at").defaultNow().notNull(),
  userId: varchar("user_id").references(() => users.id),
});

export const quizAttempts = pgTable("quiz_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quizId: varchar("quiz_id").references(() => quizzes.id).notNull(),
  userId: varchar("user_id").references(() => users.id),
  answers: json("answers").notNull(), // User's answers
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

// Content Analysis Schema
export const contentAnalysisSchema = z.object({
  summary: z.string(),
  keyConcepts: z.array(z.string()),
  medicalTerms: z.array(z.string()),
  topics: z.array(z.string()),
});

// Question Type Schemas
export const baseQuestionSchema = z.object({
  id: z.string(),
  type: z.string(),
  question: z.string(),
  explanation: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
});

export const multipleChoiceQuestionSchema = baseQuestionSchema.extend({
  type: z.literal("multiple_choice"),
  options: z.array(z.string()),
  correctAnswer: z.number(),
});

export const differentialDiagnosisQuestionSchema = baseQuestionSchema.extend({
  type: z.literal("differential_diagnosis"),
  options: z.array(z.string()),
  correctAnswers: z.array(z.number()), // Multiple correct answers
});

export const matchingQuestionSchema = baseQuestionSchema.extend({
  type: z.literal("matching"),
  leftItems: z.array(z.string()),
  rightItems: z.array(z.string()),
  correctMatches: z.array(z.object({
    left: z.number(),
    right: z.number(),
  })),
});

export const fillInBlankQuestionSchema = baseQuestionSchema.extend({
  type: z.literal("fill_in_blank"),
  blanks: z.array(z.object({
    position: z.number(),
    correctAnswer: z.string(),
    alternatives: z.array(z.string()).optional(),
  })),
});

export const trueFalseQuestionSchema = baseQuestionSchema.extend({
  type: z.literal("true_false"),
  correctAnswer: z.boolean(),
});

export const shortAnswerQuestionSchema = baseQuestionSchema.extend({
  type: z.literal("short_answer"),
  correctAnswers: z.array(z.string()),
  keywords: z.array(z.string()),
});

export const flowchartQuestionSchema = baseQuestionSchema.extend({
  type: z.literal("flowchart"),
  steps: z.array(z.object({
    id: z.string(),
    content: z.string(),
    isBlank: z.boolean(),
    correctAnswer: z.string().optional(),
  })),
});

export const wordScrambleQuestionSchema = baseQuestionSchema.extend({
  type: z.literal("word_scramble"),
  hint: z.string(),
  letters: z.array(z.string()),
  correctAnswer: z.string(),
});

export const labInterpretationQuestionSchema = baseQuestionSchema.extend({
  type: z.literal("lab_interpretation"),
  labValues: z.array(z.object({
    test: z.string(),
    value: z.string(),
    reference: z.string(),
  })),
  options: z.array(z.string()),
  correctAnswer: z.number(),
});

export const osceQuestionSchema = baseQuestionSchema.extend({
  type: z.literal("osce"),
  scenario: z.string(),
  tasks: z.array(z.string()),
  markingScheme: z.array(z.object({
    criteria: z.string(),
    points: z.number(),
    keywords: z.array(z.string()),
  })),
});

export const questionSchema = z.union([
  multipleChoiceQuestionSchema,
  differentialDiagnosisQuestionSchema,
  matchingQuestionSchema,
  fillInBlankQuestionSchema,
  trueFalseQuestionSchema,
  shortAnswerQuestionSchema,
  flowchartQuestionSchema,
  wordScrambleQuestionSchema,
  labInterpretationQuestionSchema,
  osceQuestionSchema,
]);

export const quizConfigSchema = z.object({
  questionCount: z.number().min(1).max(50),
  questionTypes: z.array(z.string()),
  difficulty: z.enum(["mixed", "easy", "medium", "hard"]).optional(),
  focusAreas: z.array(z.string()).optional(),
});

export const quizSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  questions: z.array(questionSchema),
  analysis: contentAnalysisSchema,
  createdAt: z.string(),
  questionCount: z.number(),
  questionTypes: z.array(z.string()),
});

export const userAnswerSchema = z.object({
  questionId: z.string(),
  answer: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.number()),
    z.array(z.string()),
    z.object({ left: z.number(), right: z.number() }).array(),
  ]),
});

export const quizAttemptSchema = z.object({
  quizId: z.string(),
  answers: z.array(userAnswerSchema),
  score: z.number(),
  totalQuestions: z.number(),
  completedAt: z.string(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertQuizSchema = createInsertSchema(quizzes).omit({
  id: true,
  createdAt: true,
});

export const insertQuizAttemptSchema = createInsertSchema(quizAttempts).omit({
  id: true,
  completedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Quiz = typeof quizzes.$inferSelect;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type ContentAnalysis = z.infer<typeof contentAnalysisSchema>;
export type Question = z.infer<typeof questionSchema>;
export type QuizConfig = z.infer<typeof quizConfigSchema>;
export type UserAnswer = z.infer<typeof userAnswerSchema>;
export type QuizAttemptData = z.infer<typeof quizAttemptSchema>;

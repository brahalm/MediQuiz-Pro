import { type User, type InsertUser, type Quiz, type QuizAttempt } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Quiz methods
  createQuiz(quiz: any): Promise<Quiz>;
  getQuiz(id: string): Promise<Quiz | undefined>;
  getUserQuizzes(userId?: string): Promise<Quiz[]>;
  deleteQuiz(id: string): Promise<boolean>;

  // Quiz attempt methods
  createQuizAttempt(attempt: any): Promise<QuizAttempt>;
  getQuizAttempts(quizId: string): Promise<QuizAttempt[]>;
  getUserAttempts(userId?: string): Promise<QuizAttempt[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private quizzes: Map<string, Quiz>;
  private quizAttempts: Map<string, QuizAttempt>;

  constructor() {
    this.users = new Map();
    this.quizzes = new Map();
    this.quizAttempts = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createQuiz(quizData: any): Promise<Quiz> {
    const id = randomUUID();
    const quiz: Quiz = {
      ...quizData,
      id,
      createdAt: new Date(),
    };
    this.quizzes.set(id, quiz);
    return quiz;
  }

  async getQuiz(id: string): Promise<Quiz | undefined> {
    return this.quizzes.get(id);
  }

  async getUserQuizzes(userId?: string): Promise<Quiz[]> {
    if (!userId) {
      return Array.from(this.quizzes.values());
    }
    return Array.from(this.quizzes.values()).filter(
      (quiz) => quiz.userId === userId
    );
  }

  async deleteQuiz(id: string): Promise<boolean> {
    return this.quizzes.delete(id);
  }

  async createQuizAttempt(attemptData: any): Promise<QuizAttempt> {
    const id = randomUUID();
    const attempt: QuizAttempt = {
      ...attemptData,
      id,
      completedAt: new Date(),
    };
    this.quizAttempts.set(id, attempt);
    return attempt;
  }

  async getQuizAttempts(quizId: string): Promise<QuizAttempt[]> {
    return Array.from(this.quizAttempts.values()).filter(
      (attempt) => attempt.quizId === quizId
    );
  }

  async getUserAttempts(userId?: string): Promise<QuizAttempt[]> {
    if (!userId) {
      return Array.from(this.quizAttempts.values());
    }
    return Array.from(this.quizAttempts.values()).filter(
      (attempt) => attempt.userId === userId
    );
  }
}

export const storage = new MemStorage();

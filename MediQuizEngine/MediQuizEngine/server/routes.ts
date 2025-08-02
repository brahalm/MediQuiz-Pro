import type { Express, Request } from "express";

interface MulterRequest extends Request {
  file?: any;
}
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { analyzeContent, generateQuiz, generateQuizWithProgress } from "./services/gemini";
import { processUploadedFile, validateFileUpload } from "./services/fileProcessor";
import { contentAnalysisSchema, quizConfigSchema, quizAttemptSchema } from "@shared/schema";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Content analysis endpoint
  app.post("/api/analyze-content", async (req, res) => {
    try {
      const { text } = req.body;

      if (!text || typeof text !== "string") {
        return res.status(400).json({ message: "Text content is required" });
      }

      const analysis = await analyzeContent(text);
      const validatedAnalysis = contentAnalysisSchema.parse(analysis);

      res.json(validatedAnalysis);
    } catch (error) {
      console.error("Content analysis error:", error);
      res.status(500).json({ message: "Failed to analyze content" });
    }
  });

  // File upload and analysis endpoint
  app.post("/api/analyze-file", upload.single("file"), async (req: MulterRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      validateFileUpload(req.file);
      const processedFile = await processUploadedFile(req.file);
      const analysis = await analyzeContent(processedFile.text);
      const validatedAnalysis = contentAnalysisSchema.parse(analysis);

      res.json({
        content: processedFile.text,
        analysis: validatedAnalysis,
        metadata: processedFile.metadata,
      });
    } catch (error) {
      console.error("File analysis error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to analyze file" 
      });
    }
  });

  // Profile endpoints
  app.get("/api/profile", async (req, res) => {
    try {
      // For now, return a mock profile
      const profile = {
        id: "user-1",
        username: "medstudent",
        email: "student@medical.edu",
        fullName: "Medical Student",
        bio: "Passionate about learning medical concepts through interactive quizzes",
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=medstudent`,
        joinedDate: new Date().toISOString(),
        stats: {
          totalQuizzes: 0,
          totalAttempts: 0,
          averageScore: 0,
          studyStreak: 0,
        },
      };
      res.json(profile);
    } catch (error) {
      console.error("Profile fetch error:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post("/api/profile", async (req, res) => {
    try {
      const profileData = req.body;
      const newProfile = {
        ...profileData,
        id: "user-1",
        joinedDate: new Date().toISOString(),
        stats: {
          totalQuizzes: 0,
          totalAttempts: 0,
          averageScore: 0,
          studyStreak: 0,
        },
      };
      res.json(newProfile);
    } catch (error) {
      console.error("Profile creation error:", error);
      res.status(500).json({ message: "Failed to create profile" });
    }
  });

  app.patch("/api/profile", async (req, res) => {
    try {
      const updates = req.body;
      const updatedProfile = {
        id: "user-1",
        username: "medstudent",
        email: "student@medical.edu",
        fullName: "Medical Student",
        bio: "Passionate about learning medical concepts through interactive quizzes",
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=medstudent`,
        joinedDate: new Date().toISOString(),
        stats: {
          totalQuizzes: 0,
          totalAttempts: 0,
          averageScore: 0,
          studyStreak: 0,
        },
        ...updates,
      };
      res.json(updatedProfile);
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Optimized quiz generation endpoint
  app.post("/api/generate-quiz", async (req, res) => {
    try {
      const { content, analysis, config } = req.body;

      if (!content || !analysis || !config) {
        return res.status(400).json({ message: "Content, analysis, and config are required" });
      }

      const validatedConfig = quizConfigSchema.parse(config);
      
      // Use faster model and batching
      const questions = await generateQuiz(content, analysis, validatedConfig);

      const quiz = await storage.createQuiz({
        title: `Quiz - ${new Date().toLocaleDateString()}`,
        description: `Generated from content analysis`,
        content,
        analysis,
        questions,
        questionCount: questions.length,
        questionTypes: validatedConfig.questionTypes,
        userId: null, // Anonymous for now
      });

      res.json(quiz);
    } catch (error) {
      console.error("Quiz generation error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to generate quiz" 
      });
    }
  });

  // Get all quizzes
  app.get("/api/quizzes", async (req, res) => {
    try {
      const quizzes = await storage.getUserQuizzes();
      res.json(quizzes);
    } catch (error) {
      console.error("Get quizzes error:", error);
      res.status(500).json({ message: "Failed to fetch quizzes" });
    }
  });

  // Get specific quiz
  app.get("/api/quizzes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const quiz = await storage.getQuiz(id);

      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      res.json(quiz);
    } catch (error) {
      console.error("Get quiz error:", error);
      res.status(500).json({ message: "Failed to fetch quiz" });
    }
  });

  // Delete quiz
  app.delete("/api/quizzes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteQuiz(id);

      if (!deleted) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      res.json({ message: "Quiz deleted successfully" });
    } catch (error) {
      console.error("Delete quiz error:", error);
      res.status(500).json({ message: "Failed to delete quiz" });
    }
  });

  // Submit quiz attempt
  app.post("/api/quiz-attempts", async (req, res) => {
    try {
      const attemptData = quizAttemptSchema.parse(req.body);
      
      const attempt = await storage.createQuizAttempt({
        ...attemptData,
        userId: null, // Anonymous for now
      });

      res.json(attempt);
    } catch (error) {
      console.error("Submit attempt error:", error);
      res.status(500).json({ message: "Failed to submit quiz attempt" });
    }
  });

  // Get quiz attempts
  app.get("/api/quiz-attempts/:quizId", async (req, res) => {
    try {
      const { quizId } = req.params;
      const attempts = await storage.getQuizAttempts(quizId);
      res.json(attempts);
    } catch (error) {
      console.error("Get attempts error:", error);
      res.status(500).json({ message: "Failed to fetch quiz attempts" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

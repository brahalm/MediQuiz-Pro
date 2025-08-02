export * from "@shared/schema";

export interface QuizCreationState {
  step: number;
  content: string;
  analysis: any;
  config: any;
  generatedQuiz: any;
}

export interface FileUploadState {
  file: File | null;
  uploading: boolean;
  error: string | null;
}

export interface QuizPlayerState {
  currentQuestion: number;
  answers: Record<string, any>;
  timeSpent: number;
  completed: boolean;
}

export const QUESTION_TYPES = [
  { id: "differential_diagnosis", name: "Differential Diagnosis", description: "Choose 3 correct diagnoses from 10 options" },
  { id: "multiple_choice", name: "Quick Diagnosis", description: "Choose most likely diagnosis from 4 options" },
  { id: "matching", name: "Medication Matching", description: "Match microbes to treatments or medications to uses" },
  { id: "lab_interpretation", name: "Lab Interpretation", description: "Interpret lab values and identify diagnosis" },
  { id: "true_false", name: "Short Facts", description: "True/false questions for factual knowledge" },
  { id: "flowchart", name: "Flowchart Completion", description: "Complete missing steps in biological pathways" },
  { id: "word_scramble", name: "Word Scrabble", description: "Identify medical terms using hints and letters" },
  { id: "short_answer", name: "First-Line Treatment", description: "Provide best first-line treatment options" },
  { id: "fill_in_blank", name: "Fill in the Blank", description: "Complete medical statements with correct terms" },
  { id: "osce", name: "OSCE Scenarios", description: "Clinical examination scenarios with marking schemes" },
];

export const DIFFICULTY_LEVELS = [
  { id: "mixed", name: "Mixed Difficulty" },
  { id: "easy", name: "Easy" },
  { id: "medium", name: "Medium" },
  { id: "hard", name: "Hard" },
];

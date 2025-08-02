import type { Question } from "@shared/schema";

export function parseQuizQuestions(rawQuestions: any[]): Question[] {
  return rawQuestions.map((q, index) => {
    // Ensure each question has required fields
    const baseQuestion = {
      id: q.id || `q_${Date.now()}_${index}`,
      type: q.type || "multiple_choice",
      question: q.question || "",
      explanation: q.explanation || "",
      difficulty: q.difficulty || "medium",
    };

    // Type-specific parsing
    switch (q.type) {
      case "differential_diagnosis":
        return {
          ...baseQuestion,
          type: "differential_diagnosis" as const,
          options: q.options || [],
          correctAnswers: q.correctAnswers || [],
        };

      case "matching":
        return {
          ...baseQuestion,
          type: "matching" as const,
          leftItems: q.leftItems || [],
          rightItems: q.rightItems || [],
          correctMatches: q.correctMatches || [],
        };

      case "lab_interpretation":
        return {
          ...baseQuestion,
          type: "lab_interpretation" as const,
          labValues: q.labValues || [],
          options: q.options || [],
          correctAnswer: q.correctAnswer || 0,
        };

      case "flowchart":
        return {
          ...baseQuestion,
          type: "flowchart" as const,
          steps: q.steps || [],
        };

      case "word_scramble":
        return {
          ...baseQuestion,
          type: "word_scramble" as const,
          hint: q.hint || "",
          letters: q.letters || [],
          correctAnswer: q.correctAnswer || "",
        };

      case "fill_in_blank":
        return {
          ...baseQuestion,
          type: "fill_in_blank" as const,
          blanks: q.blanks || [],
        };

      case "true_false":
        return {
          ...baseQuestion,
          type: "true_false" as const,
          correctAnswer: q.correctAnswer || false,
        };

      case "short_answer":
        return {
          ...baseQuestion,
          type: "short_answer" as const,
          correctAnswers: q.correctAnswers || [],
          keywords: q.keywords || [],
        };

      case "osce":
        return {
          ...baseQuestion,
          type: "osce" as const,
          scenario: q.scenario || "",
          tasks: q.tasks || [],
          markingScheme: q.markingScheme || [],
        };

      default: // multiple_choice
        return {
          ...baseQuestion,
          type: "multiple_choice" as const,
          options: q.options || [],
          correctAnswer: q.correctAnswer || 0,
        };
    }
  });
}

export function calculateQuizScore(questions: Question[], answers: Record<string, any>): { score: number; total: number; results: any[] } {
  let correct = 0;
  const results = questions.map((question) => {
    const userAnswer = answers[question.id];
    let isCorrect = false;

    switch (question.type) {
      case "multiple_choice":
        isCorrect = userAnswer === question.correctAnswer;
        break;

      case "differential_diagnosis":
        if (Array.isArray(userAnswer) && Array.isArray(question.correctAnswers)) {
          isCorrect = question.correctAnswers.length === userAnswer.length &&
                     question.correctAnswers.every(answer => userAnswer.includes(answer));
        }
        break;

      case "true_false":
        isCorrect = userAnswer === question.correctAnswer;
        break;

      case "matching":
        if (Array.isArray(userAnswer) && Array.isArray(question.correctMatches)) {
          isCorrect = question.correctMatches.length === userAnswer.length &&
                     question.correctMatches.every(match => 
                       userAnswer.some(userMatch => 
                         userMatch.left === match.left && userMatch.right === match.right
                       )
                     );
        }
        break;

      case "lab_interpretation":
        isCorrect = userAnswer === question.correctAnswer;
        break;

      case "short_answer":
        if (typeof userAnswer === "string" && Array.isArray(question.correctAnswers)) {
          const normalizedAnswer = userAnswer.toLowerCase().trim();
          isCorrect = question.correctAnswers.some(correct => 
            normalizedAnswer.includes(correct.toLowerCase())
          );
        }
        break;

      case "word_scramble":
        if (typeof userAnswer === "string") {
          isCorrect = userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
        }
        break;

      case "fill_in_blank":
        if (Array.isArray(userAnswer) && Array.isArray(question.blanks)) {
          isCorrect = question.blanks.every((blank, index) => {
            const userBlankAnswer = userAnswer[index];
            if (typeof userBlankAnswer === "string") {
              const normalizedAnswer = userBlankAnswer.toLowerCase().trim();
              return normalizedAnswer === blank.correctAnswer.toLowerCase().trim() ||
                     (blank.alternatives && blank.alternatives.some(alt => 
                       normalizedAnswer === alt.toLowerCase().trim()
                     ));
            }
            return false;
          });
        }
        break;

      case "flowchart":
        if (Array.isArray(userAnswer) && Array.isArray(question.steps)) {
          const blankSteps = question.steps.filter(step => step.isBlank);
          isCorrect = blankSteps.every((step, index) => {
            const userStepAnswer = userAnswer[index];
            return typeof userStepAnswer === "string" && 
                   userStepAnswer.toLowerCase().trim() === step.correctAnswer?.toLowerCase().trim();
          });
        }
        break;

      case "osce":
        // OSCE scoring is more complex - for now, use keyword matching
        if (typeof userAnswer === "string" && Array.isArray(question.markingScheme)) {
          let totalPoints = 0;
          let earnedPoints = 0;
          
          question.markingScheme.forEach(criteria => {
            totalPoints += criteria.points;
            const hasKeywords = criteria.keywords.some(keyword => 
              userAnswer.toLowerCase().includes(keyword.toLowerCase())
            );
            if (hasKeywords) {
              earnedPoints += criteria.points;
            }
          });
          
          isCorrect = earnedPoints >= totalPoints * 0.7; // 70% threshold
        }
        break;
    }

    if (isCorrect) correct++;

    return {
      questionId: question.id,
      question: question.question,
      userAnswer,
      correctAnswer: getCorrectAnswerDisplay(question),
      isCorrect,
      explanation: question.explanation,
    };
  });

  return {
    score: correct,
    total: questions.length,
    results,
  };
}

function getCorrectAnswerDisplay(question: Question): any {
  switch (question.type) {
    case "multiple_choice":
      return question.options[question.correctAnswer];
    case "differential_diagnosis":
      return question.correctAnswers.map(idx => question.options[idx]);
    case "true_false":
      return question.correctAnswer;
    case "matching":
      return question.correctMatches;
    case "lab_interpretation":
      return question.options[question.correctAnswer];
    case "short_answer":
      return question.correctAnswers;
    case "word_scramble":
      return question.correctAnswer;
    case "fill_in_blank":
      return question.blanks.map(blank => blank.correctAnswer);
    case "flowchart":
      return question.steps.filter(step => step.isBlank).map(step => step.correctAnswer);
    case "osce":
      return "See marking scheme";
    default:
      return null;
  }
}

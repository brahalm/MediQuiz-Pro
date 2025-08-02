import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuizStorage } from "@/hooks/use-local-storage";
import QuizPlayer from "@/components/quiz/quiz-player";
import QuizSummary from "@/components/quiz/quiz-summary";
import { calculateQuizScore } from "@/lib/quiz-parser";
import type { Question, UserAnswer } from "@/types/quiz";

export default function TakeQuiz() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { getQuiz, saveQuiz } = useQuizStorage();
  
  const [quiz, setQuiz] = useState<any>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [results, setResults] = useState<any>(null);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (!id) {
      toast({
        title: "Quiz Not Found",
        description: "The quiz you're looking for doesn't exist.",
        variant: "destructive",
      });
      setLocation("/quizzes");
      return;
    }

    const foundQuiz = getQuiz(id);
    if (!foundQuiz) {
      toast({
        title: "Quiz Not Found",
        description: "The quiz you're looking for doesn't exist in your library.",
        variant: "destructive",
      });
      setLocation("/quizzes");
      return;
    }

    setQuiz(foundQuiz);
  }, [id, getQuiz, setLocation, toast]);

  const handleQuizComplete = (finalAnswers: Record<string, any>) => {
    if (!quiz) return;

    const endTime = Date.now();
    const timeSpent = Math.round((endTime - startTime) / 1000 / 60); // minutes

    const scoreResults = calculateQuizScore(quiz.questions, finalAnswers);
    
    setAnswers(finalAnswers);
    setResults({
      ...scoreResults,
      timeSpent,
      percentage: Math.round((scoreResults.score / scoreResults.total) * 100),
    });
    
    // Update quiz with attempt info
    const updatedQuiz = {
      ...quiz,
      lastScore: Math.round((scoreResults.score / scoreResults.total) * 100),
      lastAttempt: new Date().toISOString(),
      attempts: (quiz.attempts || 0) + 1,
    };
    saveQuiz(updatedQuiz);
    
    setIsCompleted(true);

    toast({
      title: "Quiz Completed",
      description: `You scored ${scoreResults.score}/${scoreResults.total} (${Math.round((scoreResults.score / scoreResults.total) * 100)}%)`,
    });
  };

  const handleRetakeQuiz = () => {
    setIsCompleted(false);
    setAnswers({});
    setResults(null);
  };

  if (!quiz) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-slate-100 rounded-lg flex items-center justify-center mb-4">
              <i className="fas fa-spinner fa-spin text-slate-400 text-xl"></i>
            </div>
            <p className="text-slate-600">Loading quiz...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {!isCompleted ? (
          <>
            {/* Quiz Header */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <i className="fas fa-play-circle text-primary-600"></i>
                      <span>{quiz.title}</span>
                    </CardTitle>
                    {quiz.description && (
                      <p className="text-slate-600 mt-1">{quiz.description}</p>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setLocation("/quizzes")}
                  >
                    <i className="fas fa-times mr-2"></i>
                    Exit Quiz
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-slate-900">{quiz.questions.length}</div>
                    <div className="text-sm text-slate-600">Questions</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-slate-900">~{Math.ceil(quiz.questions.length * 1.5)}</div>
                    <div className="text-sm text-slate-600">Est. Minutes</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-slate-900">{quiz.questionTypes.length}</div>
                    <div className="text-sm text-slate-600">Question Types</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-slate-900">{quiz.attempts || 0}</div>
                    <div className="text-sm text-slate-600">Previous Attempts</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quiz Player */}
            <QuizPlayer 
              questions={quiz.questions}
              onComplete={handleQuizComplete}
            />
          </>
        ) : (
          <QuizSummary
            quiz={quiz}
            results={results}
            answers={answers}
            onRetake={handleRetakeQuiz}
            onBackToQuizzes={() => setLocation("/quizzes")}
          />
        )}
      </div>
    </div>
  );
}

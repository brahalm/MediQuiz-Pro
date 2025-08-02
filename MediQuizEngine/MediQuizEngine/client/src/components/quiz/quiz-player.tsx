import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import QuestionCard from "./question-card";
import type { Question } from "@/types/quiz";

interface QuizPlayerProps {
  questions: Question[];
  onComplete: (answers: Record<string, any>) => void;
}

export default function QuizPlayer({ questions, onComplete }: QuizPlayerProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [startTime] = useState(Date.now());
  const [timeSpent, setTimeSpent] = useState(0);

  // Update timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestion === questions.length - 1;
  const hasAnswer = answers[currentQ?.id];

  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      onComplete(answers);
    } else {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleQuestionJump = (index: number) => {
    setCurrentQuestion(index);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  if (!currentQ) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-slate-600">No questions available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Badge className="bg-primary-100 text-primary-700">
                Question {currentQuestion + 1} of {questions.length}
              </Badge>
              <div className="text-sm text-slate-600">
                <i className="fas fa-clock mr-1"></i>
                {formatTime(timeSpent)}
              </div>
              <div className="text-sm text-slate-600">
                <i className="fas fa-check-circle mr-1"></i>
                {getAnsweredCount()}/{questions.length} answered
              </div>
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <i className="fas fa-flag mr-2"></i>
                  Finish Early
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Finish Quiz Early?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You have answered {getAnsweredCount()} of {questions.length} questions. 
                    Unanswered questions will be marked as incorrect. Are you sure you want to finish now?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Continue Quiz</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onComplete(answers)}>
                    Finish Quiz
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Question Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Question Navigation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => handleQuestionJump(index)}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                  index === currentQuestion
                    ? "bg-primary-600 text-white"
                    : answers[questions[index].id]
                    ? "bg-success-100 text-success-700"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Question */}
      <QuestionCard
        question={currentQ}
        questionNumber={currentQuestion + 1}
        onAnswer={handleAnswer}
        userAnswer={answers[currentQ.id]}
      />

      {/* Navigation Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              <i className="fas fa-chevron-left mr-2"></i>
              Previous
            </Button>

            <div className="text-sm text-slate-600 text-center">
              {hasAnswer ? (
                <span className="text-success-600">
                  <i className="fas fa-check-circle mr-1"></i>
                  Answer saved
                </span>
              ) : (
                <span className="text-amber-600">
                  <i className="fas fa-exclamation-triangle mr-1"></i>
                  Please answer to continue
                </span>
              )}
            </div>

            <Button
              onClick={handleNext}
              disabled={!hasAnswer}
              className="bg-primary-600 hover:bg-primary-700"
            >
              {isLastQuestion ? (
                <>
                  <i className="fas fa-flag mr-2"></i>
                  Finish Quiz
                </>
              ) : (
                <>
                  Next
                  <i className="fas fa-chevron-right ml-2"></i>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

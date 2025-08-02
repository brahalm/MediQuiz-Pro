import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import QuestionCard from "./question-card";

interface QuizSummaryProps {
  quiz: any;
  results: {
    score: number;
    total: number;
    percentage: number;
    timeSpent: number;
    results: any[];
  };
  answers: Record<string, any>;
  onRetake: () => void;
  onBackToQuizzes: () => void;
}

export default function QuizSummary({ quiz, results, answers, onRetake, onBackToQuizzes }: QuizSummaryProps) {
  const { score, total, percentage, timeSpent, results: questionResults } = results;

  const getScoreColor = () => {
    if (percentage >= 80) return "text-success-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeColor = () => {
    if (percentage >= 80) return "bg-success-100 text-success-700";
    if (percentage >= 60) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <i className="fas fa-flag-checkered text-primary-600"></i>
            <span>Quiz Completed!</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor()}`}>
                {percentage}%
              </div>
              <div className="text-sm text-slate-600">Final Score</div>
              <Badge className={getScoreBadgeColor()}>
                {score}/{total} correct
              </Badge>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">
                {formatTime(timeSpent)}
              </div>
              <div className="text-sm text-slate-600">Time Spent</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">
                {quiz.attempts || 1}
              </div>
              <div className="text-sm text-slate-600">Attempt Number</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">
                {Math.round((score / total) * 100) >= 70 ? "Pass" : "Review"}
              </div>
              <div className="text-sm text-slate-600">
                {Math.round((score / total) * 100) >= 70 ? "Great job!" : "Study more"}
              </div>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-700">Progress</span>
              <span className="text-sm text-slate-600">{score}/{total} questions correct</span>
            </div>
            <Progress value={percentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Performance Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">By Question Type</h4>
              <div className="space-y-3">
                {Object.entries(
                  questionResults.reduce((acc: any, result: any) => {
                    const questionType = quiz.questions.find((q: any) => q.id === result.questionId)?.type || "unknown";
                    if (!acc[questionType]) {
                      acc[questionType] = { correct: 0, total: 0 };
                    }
                    acc[questionType].total++;
                    if (result.isCorrect) acc[questionType].correct++;
                    return acc;
                  }, {})
                ).map(([type, stats]: [string, any]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm text-slate-700 capitalize">
                      {type.replace("_", " ")}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">
                        {stats.correct}/{stats.total}
                      </span>
                      <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary-600 transition-all"
                          style={{ width: `${(stats.correct / stats.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Recommendations</h4>
              <div className="space-y-2 text-sm">
                {percentage >= 90 && (
                  <div className="flex items-start space-x-2 text-success-700">
                    <i className="fas fa-trophy mt-0.5"></i>
                    <span>Excellent performance! You've mastered this material.</span>
                  </div>
                )}
                {percentage >= 70 && percentage < 90 && (
                  <div className="flex items-start space-x-2 text-blue-700">
                    <i className="fas fa-thumbs-up mt-0.5"></i>
                    <span>Good job! Review the missed questions to improve further.</span>
                  </div>
                )}
                {percentage >= 50 && percentage < 70 && (
                  <div className="flex items-start space-x-2 text-yellow-700">
                    <i className="fas fa-book mt-0.5"></i>
                    <span>Study the material more thoroughly and retake the quiz.</span>
                  </div>
                )}
                {percentage < 50 && (
                  <div className="flex items-start space-x-2 text-red-700">
                    <i className="fas fa-exclamation-triangle mt-0.5"></i>
                    <span>Focus on understanding the core concepts before retaking.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Question Review</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-6">
              {questionResults.map((result: any, index: number) => {
                const question = quiz.questions.find((q: any) => q.id === result.questionId);
                if (!question) return null;

                return (
                  <div key={result.questionId} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-slate-900">
                        Question {index + 1}
                      </h4>
                      <Badge className={result.isCorrect ? "bg-success-100 text-success-700" : "bg-red-100 text-red-700"}>
                        {result.isCorrect ? "Correct" : "Incorrect"}
                      </Badge>
                    </div>
                    
                    <QuestionCard
                      question={question}
                      questionNumber={index + 1}
                      onAnswer={() => {}}
                      userAnswer={result.userAnswer}
                      disabled={true}
                      showCorrectAnswer={true}
                    />
                    
                    {!result.isCorrect && (
                      <div className="bg-red-50 rounded-lg p-4">
                        <h5 className="font-medium text-red-800 mb-2">Your Answer vs Correct Answer</h5>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-red-700">Your Answer:</span>
                            <p className="text-red-600 mt-1">
                              {JSON.stringify(result.userAnswer) || "No answer"}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-success-700">Correct Answer:</span>
                            <p className="text-success-600 mt-1">
                              {JSON.stringify(result.correctAnswer)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {index < questionResults.length - 1 && <Separator />}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBackToQuizzes}>
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Quizzes
        </Button>
        <div className="space-x-3">
          <Button variant="outline" onClick={onRetake}>
            <i className="fas fa-redo mr-2"></i>
            Retake Quiz
          </Button>
          <Button onClick={onBackToQuizzes} className="bg-primary-600 hover:bg-primary-700">
            <i className="fas fa-home mr-2"></i>
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

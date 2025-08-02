import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useQuizStorage } from "@/hooks/use-local-storage";
import { parseQuizQuestions } from "@/lib/quiz-parser";
import QuestionCard from "./question-card";

interface GeneratedQuizViewProps {
  quiz: any;
  onBack: () => void;
  onReset: () => void;
}

export default function GeneratedQuizView({ quiz, onBack, onReset }: GeneratedQuizViewProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { saveQuiz } = useQuizStorage();
  
  const parsedQuestions = parseQuizQuestions(quiz.questions || []);
  const [selectedQuestion, setSelectedQuestion] = useState(0);

  const handleSaveQuiz = () => {
    const quizToSave = {
      ...quiz,
      questions: parsedQuestions,
      id: quiz.id || `quiz_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    
    saveQuiz(quizToSave);
    
    toast({
      title: "Quiz Saved",
      description: "Your quiz has been saved to your quiz library.",
    });
  };

  const handleTakeQuiz = () => {
    handleSaveQuiz();
    setLocation(`/quiz/${quiz.id || `quiz_${Date.now()}`}/take`);
  };

  const questionTypeStats = parsedQuestions.reduce((acc, q) => {
    acc[q.type] = (acc[q.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Quiz Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <i className="fas fa-clipboard-check text-success-600"></i>
                <span>Quiz Generated Successfully!</span>
              </CardTitle>
              <p className="text-slate-600 mt-1">
                Review your quiz below and save it to your library
              </p>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleSaveQuiz} variant="outline">
                <i className="fas fa-save mr-2"></i>
                Save Quiz
              </Button>
              <Button onClick={handleTakeQuiz} className="bg-primary-600 hover:bg-primary-700">
                <i className="fas fa-play mr-2"></i>
                Take Quiz Now
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">{parsedQuestions.length}</div>
              <div className="text-sm text-slate-600">Total Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">{Object.keys(questionTypeStats).length}</div>
              <div className="text-sm text-slate-600">Question Types</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">~{Math.ceil(parsedQuestions.length * 1.5)}</div>
              <div className="text-sm text-slate-600">Est. Minutes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success-600">Ready</div>
              <div className="text-sm text-slate-600">Status</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quiz Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Question List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Questions Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {parsedQuestions.map((question, index) => (
                  <div
                    key={question.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                      selectedQuestion === index
                        ? "bg-primary-50 border-primary-200"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                    }`}
                    onClick={() => setSelectedQuestion(index)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">Question {index + 1}</span>
                      <Badge variant="outline" className="text-xs">
                        {question.type.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {question.question}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Question Preview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Question Preview</span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedQuestion(Math.max(0, selectedQuestion - 1))}
                  disabled={selectedQuestion === 0}
                >
                  <i className="fas fa-chevron-left"></i>
                </Button>
                <span className="text-sm text-slate-600">
                  {selectedQuestion + 1} of {parsedQuestions.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedQuestion(Math.min(parsedQuestions.length - 1, selectedQuestion + 1))}
                  disabled={selectedQuestion === parsedQuestions.length - 1}
                >
                  <i className="fas fa-chevron-right"></i>
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {parsedQuestions[selectedQuestion] && (
              <QuestionCard
                question={parsedQuestions[selectedQuestion]}
                questionNumber={selectedQuestion + 1}
                onAnswer={() => {}} // Preview mode - no answer handling
                disabled={true}
                showCorrectAnswer={true}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Question Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Question Type Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(questionTypeStats).map(([type, count]) => (
              <Badge key={type} className="bg-primary-100 text-primary-700">
                {type.replace("_", " ")}: {count}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <div className="space-x-2">
          <Button variant="outline" onClick={onBack}>
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Configuration
          </Button>
          <Button variant="outline" onClick={onReset}>
            <i className="fas fa-refresh mr-2"></i>
            Create New Quiz
          </Button>
        </div>
        <div className="space-x-2">
          <Link href="/quizzes">
            <Button variant="outline">
              <i className="fas fa-list mr-2"></i>
              View All Quizzes
            </Button>
          </Link>
          <Button onClick={handleTakeQuiz} className="bg-primary-600 hover:bg-primary-700" size="lg">
            <i className="fas fa-play mr-2"></i>
            Start Quiz
          </Button>
        </div>
      </div>
    </div>
  );
}

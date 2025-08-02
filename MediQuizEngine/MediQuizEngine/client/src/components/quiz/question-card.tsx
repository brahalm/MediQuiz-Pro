import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { z } from "zod";
import { questionSchema } from "@shared/schema";

type Question = z.infer<typeof questionSchema>;

interface QuestionCardProps {
  question: Question;
  questionIndex: number;
  selectedAnswer?: string | string[];
  onAnswerChange: (answer: string | string[]) => void;
  showResults?: boolean;
  isCorrect?: boolean;
  showExplanation?: boolean;
}

export default function QuestionCard({
  question,
  questionIndex,
  selectedAnswer,
  onAnswerChange,
  showResults = false,
  isCorrect,
  showExplanation = false,
}: QuestionCardProps) {
  const renderQuestionContent = () => {
    switch (question.type) {
      case "multiple_choice":
      case "lab_interpretation":
        return (
          <RadioGroup
            value={selectedAnswer as string}
            onValueChange={(value) => onAnswerChange(value)}
            disabled={showResults}
            className="space-y-3"
          >
            {"options" in question && question.options?.map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <RadioGroupItem value={option} id={`q${questionIndex}-${index}`} className="text-blue-600" />
                <Label htmlFor={`q${questionIndex}-${index}`} className="flex-1 cursor-pointer text-slate-700">
                  {option}
                </Label>
                {showResults && "correctAnswer" in question && index === question.correctAnswer && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
              </div>
            ))}
          </RadioGroup>
        );

      case "true_false":
        return (
          <RadioGroup
            value={selectedAnswer as string}
            onValueChange={(value) => onAnswerChange(value)}
            disabled={showResults}
            className="space-y-3"
          >
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <RadioGroupItem value="true" id={`q${questionIndex}-true`} className="text-blue-600" />
              <Label htmlFor={`q${questionIndex}-true`} className="flex-1 cursor-pointer text-slate-700">True</Label>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <RadioGroupItem value="false" id={`q${questionIndex}-false`} className="text-blue-600" />
              <Label htmlFor={`q${questionIndex}-false`} className="flex-1 cursor-pointer text-slate-700">False</Label>
            </div>
          </RadioGroup>
        );

      case "differential_diagnosis":
        return (
          <div className="space-y-3">
            {"options" in question && question.options?.map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <Checkbox
                  id={`q${questionIndex}-${index}`}
                  checked={(selectedAnswer as string[])?.includes(option) || false}
                  onCheckedChange={(checked) => {
                    const currentAnswers = (selectedAnswer as string[]) || [];
                    if (checked) {
                      onAnswerChange([...currentAnswers, option]);
                    } else {
                      onAnswerChange(currentAnswers.filter((a) => a !== option));
                    }
                  }}
                  disabled={showResults}
                  className="text-blue-600"
                />
                <Label htmlFor={`q${questionIndex}-${index}`} className="flex-1 cursor-pointer text-slate-700">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      case "fill_in_blank":
      case "short_answer":
      case "word_scramble":
        return (
          <Input
            value={selectedAnswer as string || ""}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder="Enter your answer..."
            disabled={showResults}
            className={showResults ? (isCorrect ? "border-green-500" : "border-red-500") : ""}
          />
        );

      case "osce":
        return (
          <div className="space-y-4">
            {"scenario" in question && <p className="text-sm text-slate-600 mb-4">{question.scenario}</p>}
            <Textarea
              value={selectedAnswer as string || ""}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder="Enter your detailed answer..."
              disabled={showResults}
              rows={6}
              className={showResults ? (isCorrect ? "border-green-500" : "border-red-500") : ""}
            />
          </div>
        );

      case "matching":
        return (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">Match the items from the left column with the right column:</p>
            {"leftItems" in question && "rightItems" in question && question.leftItems?.map((leftItem: string, index: number) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                <div className="flex-1 font-medium">{leftItem}</div>
                <div className="flex-1">{question.rightItems?.[index] || ""}</div>
                {showResults && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
              </div>
            ))}
          </div>
        );

      case "flowchart":
        return (
          <div className="space-y-2">
            <p className="text-sm text-slate-600">Complete the flowchart steps:</p>
            {"steps" in question && question.steps?.map((step: any, index: number) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Badge variant="outline">{index + 1}</Badge>
                <div className="flex-1">{step.content}</div>
                {showResults && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className="text-center text-slate-500 py-8">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Unknown question type: {question.type}</p>
          </div>
        );
    }
  };

  return (
    <Card className={`mb-6 ${showResults ? (isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50") : ""}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold">
            Question {questionIndex + 1}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {question.type.replace("_", " ")}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {question.difficulty}
            </Badge>
            {showResults && (
              <div className="flex items-center gap-1">
                {isCorrect ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
            )}
          </div>
        </div>
        <p className="text-slate-700 leading-relaxed">{question.question}</p>
      </CardHeader>
      <CardContent>
        {renderQuestionContent()}
        
        {showExplanation && question.explanation && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">Explanation</span>
            </div>
            <p className="text-blue-800 text-sm leading-relaxed">{question.explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
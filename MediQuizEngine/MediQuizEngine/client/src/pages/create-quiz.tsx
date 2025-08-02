import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import ContentInputForm from "@/components/quiz/content-input-form";
import AnalysisResults from "@/components/quiz/analysis-results";
import QuizConfigForm from "@/components/quiz/quiz-config-form";
import GeneratedQuizView from "@/components/quiz/generated-quiz-view";
import type { QuizCreationState, ContentAnalysis, QuizConfig } from "@/types/quiz";

const steps = [
  { id: 1, name: "Content Input", description: "Upload or paste your study materials" },
  { id: 2, name: "AI Analysis", description: "Review extracted concepts and summary" },
  { id: 3, name: "Quiz Configuration", description: "Choose question types and settings" },
  { id: 4, name: "Generated Quiz", description: "Review and save your quiz" },
];

export default function CreateQuiz() {
  const [state, setState] = useState<QuizCreationState>({
    step: 1,
    content: "",
    analysis: null,
    config: null,
    generatedQuiz: null,
  });

  const handleContentSubmit = (content: string) => {
    setState(prev => ({
      ...prev,
      content,
      step: 2,
    }));
  };

  const handleAnalysisComplete = (analysis: ContentAnalysis) => {
    setState(prev => ({
      ...prev,
      analysis,
      step: 3,
    }));
  };

  const handleConfigSubmit = (config: QuizConfig) => {
    setState(prev => ({
      ...prev,
      config,
      step: 4,
    }));
  };

  const handleQuizGenerated = (quiz: any) => {
    setState(prev => ({
      ...prev,
      generatedQuiz: quiz,
    }));
  };

  const goToStep = (step: number) => {
    if (step <= state.step) {
      setState(prev => ({ ...prev, step }));
    }
  };

  const resetWizard = () => {
    setState({
      step: 1,
      content: "",
      analysis: null,
      config: null,
      generatedQuiz: null,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Medical Quiz</h1>
          <p className="text-slate-600">Transform your study materials into interactive quizzes with AI</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold cursor-pointer transition-colors ${
                    state.step >= step.id 
                      ? "bg-primary-600 text-white" 
                      : "bg-slate-200 text-slate-500"
                  }`}
                  onClick={() => goToStep(step.id)}
                >
                  {state.step > step.id ? (
                    <i className="fas fa-check text-sm"></i>
                  ) : (
                    step.id
                  )}
                </div>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 rounded ${
                    state.step > step.id ? "bg-primary-600" : "bg-slate-200"
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <h2 className="text-xl font-semibold text-slate-900">
              {steps[state.step - 1]?.name}
            </h2>
            <p className="text-slate-600 text-sm">
              {steps[state.step - 1]?.description}
            </p>
          </div>

          <Progress value={(state.step / steps.length) * 100} className="mt-4" />
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          {state.step === 1 && (
            <ContentInputForm 
              onContentSubmit={handleContentSubmit}
              onAnalysisComplete={handleAnalysisComplete}
            />
          )}

          {state.step === 2 && state.analysis && (
            <AnalysisResults 
              analysis={state.analysis}
              content={state.content}
              onNext={() => setState(prev => ({ ...prev, step: 3 }))}
              onBack={() => setState(prev => ({ ...prev, step: 1 }))}
            />
          )}

          {state.step === 3 && state.analysis && (
            <QuizConfigForm 
              analysis={state.analysis}
              content={state.content}
              onConfigSubmit={handleConfigSubmit}
              onQuizGenerated={handleQuizGenerated}
              onBack={() => setState(prev => ({ ...prev, step: 2 }))}
            />
          )}

          {state.step === 4 && state.generatedQuiz && (
            <GeneratedQuizView 
              quiz={state.generatedQuiz}
              onBack={() => setState(prev => ({ ...prev, step: 3 }))}
              onReset={resetWizard}
            />
          )}
        </div>
      </div>
    </div>
  );
}

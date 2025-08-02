import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { QUESTION_TYPES, DIFFICULTY_LEVELS } from "@/types/quiz";
import type { ContentAnalysis, QuizConfig } from "@/types/quiz";
import ProgressBar from "./progress-bar";

const formSchema = z.object({
  questionCount: z.number().min(1).max(50),
  questionTypes: z.array(z.string()).min(1, "Select at least one question type"),
  difficulty: z.string().optional(),
  focusAreas: z.array(z.string()).optional(),
});

interface QuizConfigFormProps {
  analysis: ContentAnalysis;
  content: string;
  onConfigSubmit: (config: QuizConfig) => void;
  onQuizGenerated: (quiz: any) => void;
  onBack: () => void;
}

export default function QuizConfigForm({ 
  analysis, 
  content, 
  onConfigSubmit, 
  onQuizGenerated, 
  onBack 
}: QuizConfigFormProps) {
  const [questionCount, setQuestionCount] = useState([20]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      questionCount: 20,
      questionTypes: ["multiple_choice", "differential_diagnosis", "matching"],
      difficulty: "mixed",
      focusAreas: analysis.topics.slice(0, 3),
    },
  });

  const [generationProgress, setGenerationProgress] = useState<{
    progress: number;
    stage: string;
    message: string;
    isGenerating: boolean;
    isComplete: boolean;
    isError: boolean;
  }>({
    progress: 0,
    stage: 'idle',
    message: '',
    isGenerating: false,
    isComplete: false,
    isError: false,
  });

  const generateQuizMutation = useMutation({
    mutationFn: async (config: QuizConfig) => {
      setGenerationProgress({
        progress: 0,
        stage: 'starting',
        message: 'Initializing quiz generation...',
        isGenerating: true,
        isComplete: false,
        isError: false,
      });

      // Simulate progress updates for now and use regular API call
      const progressSteps = [
        { progress: 10, message: 'Validating configuration...' },
        { progress: 30, message: 'Analyzing content structure...' },
        { progress: 50, message: 'Generating quiz questions...' },
        { progress: 70, message: 'Optimizing question quality...' },
        { progress: 90, message: 'Finalizing quiz...' },
      ];

      // Update progress every 2 seconds
      let currentStep = 0;
      const progressInterval = setInterval(() => {
        if (currentStep < progressSteps.length) {
          const step = progressSteps[currentStep];
          setGenerationProgress(prev => ({
            ...prev,
            progress: step.progress,
            message: step.message,
          }));
          currentStep++;
        }
      }, 1500);

      try {
        const response = await apiRequest("/api/generate-quiz", {
          method: "POST",
          body: JSON.stringify({
            content,
            analysis,
            config,
          }),
        });

        clearInterval(progressInterval);
        
        setGenerationProgress(prev => ({
          ...prev,
          progress: 100,
          isGenerating: false,
          isComplete: true,
          message: 'Quiz generated successfully!',
        }));

        return response;
      } catch (error) {
        clearInterval(progressInterval);
        throw error;
      }
    },
    onSuccess: (quiz) => {
      onQuizGenerated(quiz);
      toast({
        title: "Quiz Generated Successfully",
        description: `Created ${quiz.questions.length} questions based on your content.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Quiz Generation Failed",
        description: error.message || "Failed to generate quiz. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const config: QuizConfig = {
      questionCount: questionCount[0],
      questionTypes: values.questionTypes,
      difficulty: values.difficulty as any,
      focusAreas: values.focusAreas,
    };
    
    onConfigSubmit(config);
    generateQuizMutation.mutate(config);
  };

  return (
    <div className="space-y-6 relative">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <i className="fas fa-cog text-primary-600"></i>
            <span>Quiz Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Question Count */}
              <div className="space-y-3">
                <FormLabel>Number of Questions: {questionCount[0]}</FormLabel>
                <Slider
                  value={questionCount}
                  onValueChange={setQuestionCount}
                  max={50}
                  min={5}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>5</span>
                  <span>25</span>
                  <span>50</span>
                </div>
              </div>

              {/* Question Types */}
              <FormField
                control={form.control}
                name="questionTypes"
                render={() => (
                  <FormItem>
                    <FormLabel>Question Types</FormLabel>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {QUESTION_TYPES.map((type) => (
                        <FormField
                          key={type.id}
                          control={form.control}
                          name="questionTypes"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(type.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, type.id])
                                      : field.onChange(
                                          field.value?.filter((value) => value !== type.id)
                                        );
                                  }}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="font-medium">
                                  {type.name}
                                </FormLabel>
                                <p className="text-xs text-slate-500">
                                  {type.description}
                                </p>
                              </div>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Difficulty Level */}
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DIFFICULTY_LEVELS.map((level) => (
                          <SelectItem key={level.id} value={level.id}>
                            {level.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Focus Areas */}
              <FormField
                control={form.control}
                name="focusAreas"
                render={() => (
                  <FormItem>
                    <FormLabel>Focus Areas (Optional)</FormLabel>
                    <p className="text-sm text-slate-500 mb-3">
                      Select specific topics to emphasize in your quiz
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.topics.map((topic) => (
                        <FormField
                          key={topic}
                          control={form.control}
                          name="focusAreas"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div>
                                  <Checkbox
                                    id={topic}
                                    checked={field.value?.includes(topic)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), topic])
                                        : field.onChange(
                                            field.value?.filter((value) => value !== topic)
                                          );
                                    }}
                                    className="sr-only"
                                  />
                                  <label
                                    htmlFor={topic}
                                    className={`cursor-pointer inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                      field.value?.includes(topic)
                                        ? "bg-primary-600 text-white"
                                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                    }`}
                                  >
                                    {topic}
                                  </label>
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Summary */}
              <Card className="bg-slate-50">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-slate-900 mb-2">Quiz Summary</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Questions:</strong> {questionCount[0]}</p>
                    <p><strong>Types:</strong> {form.watch("questionTypes")?.length || 0} selected</p>
                    <p><strong>Difficulty:</strong> {DIFFICULTY_LEVELS.find(d => d.id === form.watch("difficulty"))?.name || "Mixed"}</p>
                    <p><strong>Focus Areas:</strong> {form.watch("focusAreas")?.length || 0} selected</p>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onBack}
                  disabled={generationProgress.isGenerating}
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  Back to Analysis
                </Button>
                <Button 
                  type="submit" 
                  disabled={generationProgress.isGenerating}
                  className="bg-primary-600 hover:bg-primary-700"
                >
                  {generationProgress.isGenerating ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Generating Quiz...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-magic mr-2"></i>
                      Generate Quiz
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Progress Bar Overlay */}
      {generationProgress.isGenerating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <ProgressBar
            progress={generationProgress.progress}
            stage={generationProgress.stage}
            message={generationProgress.message}
            isComplete={generationProgress.isComplete}
            isError={generationProgress.isError}
          />
        </div>
      )}
    </div>
  );
}

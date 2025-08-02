import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import FileUpload from "@/components/ui/file-upload";
import type { ContentAnalysis } from "@/types/quiz";

interface ContentInputFormProps {
  onContentSubmit: (content: string) => void;
  onAnalysisComplete: (analysis: ContentAnalysis) => void;
}

export default function ContentInputForm({ onContentSubmit, onAnalysisComplete }: ContentInputFormProps) {
  const [textContent, setTextContent] = useState("");
  const [activeTab, setActiveTab] = useState("text");
  const { toast } = useToast();

  const analyzeTextMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await apiRequest("POST", "/api/analyze-content", { text });
      return response.json();
    },
    onSuccess: (analysis) => {
      onContentSubmit(textContent);
      onAnalysisComplete(analysis);
      toast({
        title: "Content Analyzed Successfully",
        description: "AI has analyzed your content and extracted key medical concepts.",
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze content. Please try again.",
        variant: "destructive",
      });
    },
  });

  const analyzeFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch("/api/analyze-file", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to analyze file");
      }
      
      return response.json();
    },
    onSuccess: (result) => {
      onContentSubmit(result.content);
      onAnalysisComplete(result.analysis);
      toast({
        title: "File Analyzed Successfully",
        description: `Extracted content from ${result.metadata.filename} and analyzed key concepts.`,
      });
    },
    onError: (error) => {
      toast({
        title: "File Analysis Failed",
        description: error.message || "Failed to analyze file. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleTextAnalyze = () => {
    if (!textContent.trim()) {
      toast({
        title: "No Content",
        description: "Please enter some text content to analyze.",
        variant: "destructive",
      });
      return;
    }
    analyzeTextMutation.mutate(textContent);
  };

  const handleFileAnalyze = (file: File) => {
    analyzeFileMutation.mutate(file);
  };

  const isLoading = analyzeTextMutation.isPending || analyzeFileMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <i className="fas fa-upload text-primary-600"></i>
          <span>Upload Study Materials</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text" className="flex items-center space-x-2">
              <i className="fas fa-keyboard text-sm"></i>
              <span>Paste Text</span>
            </TabsTrigger>
            <TabsTrigger value="file" className="flex items-center space-x-2">
              <i className="fas fa-cloud-upload-alt text-sm"></i>
              <span>Upload File</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Medical Content
              </label>
              <Textarea
                placeholder="Paste your medical study materials here... (e.g., lecture notes, textbook content, clinical guidelines)"
                className="min-h-[300px] resize-y"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-slate-500 mt-2">
                Include any medical text content you'd like to create quizzes from
              </p>
            </div>

            <Button
              onClick={handleTextAnalyze}
              disabled={!textContent.trim() || isLoading}
              className="w-full bg-primary-600 hover:bg-primary-700"
              size="lg"
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Analyzing Content...
                </>
              ) : (
                <>
                  <i className="fas fa-brain mr-2"></i>
                  Analyze Content with AI
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="file" className="space-y-4">
            <FileUpload
              onFileSelect={() => {}} // File selection handling is internal to FileUpload
              onFileAnalyze={handleFileAnalyze}
              loading={isLoading}
              error={analyzeFileMutation.error?.message}
            />
          </TabsContent>
        </Tabs>

        <Separator className="my-6" />

        <div className="bg-slate-50 rounded-lg p-4">
          <h4 className="font-semibold text-slate-900 mb-2 flex items-center">
            <i className="fas fa-lightbulb text-yellow-500 mr-2"></i>
            Tips for Better Results
          </h4>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>• Include detailed medical content with terminology and concepts</li>
            <li>• Upload high-quality PDFs or PowerPoint presentations</li>
            <li>• Ensure content covers specific topics you want to be quizzed on</li>
            <li>• Clinical cases and diagnostic information work especially well</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { ContentAnalysis } from "@/types/quiz";

interface AnalysisResultsProps {
  analysis: ContentAnalysis;
  content: string;
  onNext: () => void;
  onBack: () => void;
}

export default function AnalysisResults({ analysis, content, onNext, onBack }: AnalysisResultsProps) {
  const contentPreview = content.length > 200 ? content.substring(0, 200) + "..." : content;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <i className="fas fa-brain text-success-600"></i>
            <span>AI Content Analysis Results</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Content Summary */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Content Summary</h3>
            <Card className="bg-slate-50">
              <CardContent className="p-4">
                <p className="text-slate-700 leading-relaxed">{analysis.summary}</p>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Key Concepts */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Key Medical Concepts</h3>
            <div className="flex flex-wrap gap-2">
              {analysis.keyConcepts.map((concept, index) => (
                <Badge key={index} className="bg-primary-100 text-primary-700 hover:bg-primary-200">
                  {concept}
                </Badge>
              ))}
            </div>
            {analysis.keyConcepts.length === 0 && (
              <p className="text-slate-500 text-sm">No key concepts identified</p>
            )}
          </div>

          <Separator />

          {/* Medical Terms */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Medical Terms</h3>
            <div className="flex flex-wrap gap-2">
              {analysis.medicalTerms.map((term, index) => (
                <Badge key={index} variant="secondary">
                  {term}
                </Badge>
              ))}
            </div>
            {analysis.medicalTerms.length === 0 && (
              <p className="text-slate-500 text-sm">No medical terms identified</p>
            )}
          </div>

          <Separator />

          {/* Topic Areas */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Topic Areas</h3>
            <div className="flex flex-wrap gap-2">
              {analysis.topics.map((topic, index) => (
                <Badge key={index} className="bg-success-100 text-success-700 hover:bg-success-200">
                  {topic}
                </Badge>
              ))}
            </div>
            {analysis.topics.length === 0 && (
              <p className="text-slate-500 text-sm">No specific topics identified</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Original Content Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <i className="fas fa-file-alt text-slate-600"></i>
            <span>Original Content Preview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-50 rounded-lg p-4 max-h-48 overflow-y-auto">
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{contentPreview}</p>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {content.length} characters analyzed
          </p>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Content Input
        </Button>
        <Button onClick={onNext} className="bg-primary-600 hover:bg-primary-700">
          Continue to Quiz Configuration
          <i className="fas fa-arrow-right ml-2"></i>
        </Button>
      </div>
    </div>
  );
}

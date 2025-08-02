import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface ProgressBarProps {
  progress: number;
  stage: string;
  message: string;
  isComplete?: boolean;
  isError?: boolean;
}

export default function ProgressBar({ progress, stage, message, isComplete, isError }: ProgressBarProps) {
  const getStageIcon = () => {
    if (isError) return <AlertCircle className="h-5 w-5 text-red-500" />;
    if (isComplete) return <CheckCircle className="h-5 w-5 text-green-500" />;
    return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
  };

  const getStageColor = () => {
    if (isError) return "text-red-600";
    if (isComplete) return "text-green-600";
    return "text-blue-600";
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          {getStageIcon()}
          <div className="flex-1">
            <h3 className={`font-semibold ${getStageColor()}`}>
              {isError ? "Error" : isComplete ? "Complete" : "Generating Quiz"}
            </h3>
            <p className="text-sm text-slate-600">{message}</p>
          </div>
        </div>
        
        <Progress 
          value={progress} 
          className="w-full h-2 mb-2" 
        />
        
        <div className="flex justify-between text-xs text-slate-500">
          <span className="capitalize">{stage}</span>
          <span>{progress}%</span>
        </div>
      </CardContent>
    </Card>
  );
}
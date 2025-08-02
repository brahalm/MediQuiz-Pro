import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getFileIcon, formatFileSize, validateFileType, validateFileSize } from "@/lib/file-utils";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileAnalyze: (file: File) => void;
  loading?: boolean;
  error?: string | null;
}

export default function FileUpload({ onFileSelect, onFileAnalyze, loading = false, error }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!validateFileType(file)) {
      return; // Error handling should be done in parent component
    }

    if (!validateFileSize(file)) {
      return; // Error handling should be done in parent component
    }

    setSelectedFile(file);
    onFileSelect(file);
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleAnalyze = () => {
    if (selectedFile) {
      onFileAnalyze(selectedFile);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
  };

  return (
    <div className="space-y-4">
      {!selectedFile ? (
        <Card 
          {...getRootProps()} 
          className={`border-2 border-dashed cursor-pointer transition-colors ${
            isDragActive 
              ? "border-primary-400 bg-primary-50" 
              : "border-slate-300 hover:border-slate-400"
          }`}
        >
          <input {...getInputProps()} />
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-slate-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-cloud-upload-alt text-slate-400 text-2xl"></i>
            </div>
            <div>
              <p className="text-lg font-medium text-slate-900">
                {isDragActive ? "Drop your file here" : "Drop files here or click to browse"}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Supports PDF, PPTX, TXT, JPG, PNG, GIF (max 10MB)
              </p>
            </div>
            <div className="flex justify-center space-x-2">
              <Badge variant="outline">PDF</Badge>
              <Badge variant="outline">PPTX</Badge>
              <Badge variant="outline">TXT</Badge>
              <Badge variant="outline">Images</Badge>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <i className={`${getFileIcon(selectedFile.type)} text-primary-600`}></i>
                </div>
                <div>
                  <p className="font-medium text-slate-900">{selectedFile.name}</p>
                  <p className="text-sm text-slate-500">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="bg-primary-600 hover:bg-primary-700"
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-brain mr-2"></i>
                      Analyze Content
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={removeFile} disabled={loading}>
                  <i className="fas fa-times"></i>
                </Button>
              </div>
            </div>
            
            {loading && (
              <div className="mt-4">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-sm text-slate-500 mt-2">
                  AI is analyzing your medical content...
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-700">
              <i className="fas fa-exclamation-triangle"></i>
              <p className="text-sm font-medium">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useQuizStorage } from "@/hooks/use-local-storage";
import { formatFileSize } from "@/lib/file-utils";

export default function SavedQuizzesList() {
  const { savedQuizzes, deleteQuiz } = useQuizStorage();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [filterBy, setFilterBy] = useState("all");

  const handleDeleteQuiz = (quizId: string, quizTitle: string) => {
    deleteQuiz(quizId);
    toast({
      title: "Quiz Deleted",
      description: `"${quizTitle}" has been removed from your library.`,
    });
  };

  const getQuizIcon = (questionTypes: string[]) => {
    if (questionTypes.includes("differential_diagnosis")) return "fas fa-stethoscope";
    if (questionTypes.includes("lab_interpretation")) return "fas fa-vial";
    if (questionTypes.includes("matching")) return "fas fa-pills";
    if (questionTypes.includes("osce")) return "fas fa-clipboard-check";
    return "fas fa-brain";
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return "bg-success-100 text-success-700";
    if (score >= 60) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  // Filter and sort quizzes
  const filteredQuizzes = savedQuizzes
    .filter(quiz => {
      const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (quiz.description && quiz.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (filterBy === "all") return matchesSearch;
      if (filterBy === "high-score") return matchesSearch && (quiz.lastScore || 0) >= 80;
      if (filterBy === "recent") return matchesSearch && new Date(quiz.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      if (filterBy === "needs-review") return matchesSearch && (quiz.lastScore || 0) < 70;
      
      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        case "score":
          return (b.lastScore || 0) - (a.lastScore || 0);
        case "questions":
          return b.questionCount - a.questionCount;
        default:
          return 0;
      }
    });

  if (savedQuizzes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto bg-slate-100 rounded-lg flex items-center justify-center mb-4">
          <i className="fas fa-clipboard-list text-slate-400 text-2xl"></i>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No Quizzes Yet</h3>
        <p className="text-slate-600 mb-6">
          Create your first quiz by uploading study materials and letting AI generate questions for you.
        </p>
        <Link href="/create-quiz">
          <Button className="bg-primary-600 hover:bg-primary-700">
            <i className="fas fa-plus mr-2"></i>
            Create Your First Quiz
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search quizzes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recent</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="score">Score</SelectItem>
              <SelectItem value="questions">Questions</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Quizzes</SelectItem>
              <SelectItem value="recent">Recent</SelectItem>
              <SelectItem value="high-score">High Score</SelectItem>
              <SelectItem value="needs-review">Needs Review</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Count */}
      {filteredQuizzes.length > 0 && (
        <p className="text-sm text-slate-600">
          Showing {filteredQuizzes.length} of {savedQuizzes.length} quiz{savedQuizzes.length !== 1 ? 'es' : ''}
        </p>
      )}

      {/* Quiz List */}
      <div className="space-y-4">
        {filteredQuizzes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-600">No quizzes match your current search and filters.</p>
          </div>
        ) : (
          filteredQuizzes.map((quiz) => (
            <Card key={quiz.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      quiz.questionTypes.includes("differential_diagnosis") ? "bg-primary-100" :
                      quiz.questionTypes.includes("lab_interpretation") ? "bg-purple-100" :
                      quiz.questionTypes.includes("matching") ? "bg-success-100" :
                      quiz.questionTypes.includes("osce") ? "bg-orange-100" :
                      "bg-slate-100"
                    }`}>
                      <i className={`${getQuizIcon(quiz.questionTypes)} ${
                        quiz.questionTypes.includes("differential_diagnosis") ? "text-primary-600" :
                        quiz.questionTypes.includes("lab_interpretation") ? "text-purple-600" :
                        quiz.questionTypes.includes("matching") ? "text-success-600" :
                        quiz.questionTypes.includes("osce") ? "text-orange-600" :
                        "text-slate-600"
                      }`}></i>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate">
                        {quiz.title}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">
                        {quiz.questionCount} questions • {quiz.questionTypes.length} types • Created {formatDate(quiz.createdAt)}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {quiz.questionTypes.slice(0, 3).map((type: string) => (
                          <Badge key={type} variant="outline" className="text-xs">
                            {type.replace("_", " ")}
                          </Badge>
                        ))}
                        {quiz.questionTypes.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{quiz.questionTypes.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      {quiz.lastScore !== undefined ? (
                        <>
                          <p className={`text-sm font-medium ${getScoreColor(quiz.lastScore)}`}>
                            Last Score: {quiz.lastScore}%
                          </p>
                          <p className="text-xs text-slate-500">
                            Attempted {quiz.attempts || 1} time{(quiz.attempts || 1) !== 1 ? 's' : ''}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-slate-500">Not attempted</p>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Link href={`/quiz/${quiz.id}/take`}>
                        <Button size="sm" className="bg-primary-600 hover:bg-primary-700">
                          <i className="fas fa-play mr-1"></i>
                          Take
                        </Button>
                      </Link>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <i className="fas fa-trash"></i>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Quiz</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{quiz.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

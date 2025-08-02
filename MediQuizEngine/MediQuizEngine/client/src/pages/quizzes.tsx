import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import SavedQuizzesList from "@/components/quiz/saved-quizzes-list";
import { useQuizStorage } from "@/hooks/use-local-storage";

const stats = [
  { icon: "fas fa-clipboard-list", label: "Total Quizzes", value: "totalQuizzes", color: "bg-primary-100 text-primary-600" },
  { icon: "fas fa-chart-line", label: "Avg. Score", value: "avgScore", color: "bg-success-100 text-success-600" },
  { icon: "fas fa-clock", label: "Study Hours", value: "studyHours", color: "bg-purple-100 text-purple-600" },
  { icon: "fas fa-fire", label: "Streak", value: "streak", color: "bg-orange-100 text-orange-600" },
];

export default function Quizzes() {
  const { savedQuizzes } = useQuizStorage();

  // Calculate stats
  const totalQuizzes = savedQuizzes.length;
  const avgScore = savedQuizzes.length > 0 ? Math.round(savedQuizzes.reduce((acc, quiz) => acc + (quiz.lastScore || 0), 0) / savedQuizzes.length) : 0;
  const studyHours = Math.round(savedQuizzes.length * 0.5); // Estimate based on number of quizzes
  const streak = 12; // This would come from actual usage tracking

  const statsValues = { totalQuizzes, avgScore, studyHours, streak };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Quizzes</h1>
            <p className="text-slate-600">Manage and review your medical quiz collection</p>
          </div>
          <Link href="/create-quiz">
            <Button className="bg-primary-600 hover:bg-primary-700 shadow-lg">
              <i className="fas fa-plus mr-2"></i>
              Create New Quiz
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {stat.value === "avgScore" ? `${statsValues[stat.value as keyof typeof statsValues]}%` : 
                       stat.value === "streak" ? `${statsValues[stat.value as keyof typeof statsValues]} days` :
                       statsValues[stat.value as keyof typeof statsValues]}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                    <i className={stat.icon}></i>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/create-quiz" className="block">
                <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 border-dashed border-slate-300 hover:border-primary-300">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto bg-primary-100 rounded-lg flex items-center justify-center mb-3">
                      <i className="fas fa-plus text-primary-600"></i>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-1">Create New Quiz</h3>
                    <p className="text-sm text-slate-600">Upload content and generate AI-powered questions</p>
                  </CardContent>
                </Card>
              </Link>

              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto bg-success-100 rounded-lg flex items-center justify-center mb-3">
                    <i className="fas fa-random text-success-600"></i>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">Random Quiz</h3>
                  <p className="text-sm text-slate-600">Take a randomly selected quiz from your library</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                    <i className="fas fa-chart-bar text-purple-600"></i>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">Progress Report</h3>
                  <p className="text-sm text-slate-600">View detailed analytics and performance insights</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Saved Quizzes */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Saved Quizzes</CardTitle>
              <Badge variant="secondary">{savedQuizzes.length} quiz{savedQuizzes.length !== 1 ? 'es' : ''}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <SavedQuizzesList />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

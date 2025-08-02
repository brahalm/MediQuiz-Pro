import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const questionTypes = [
  { icon: "fas fa-stethoscope", name: "Differential Diagnosis", description: "Choose 3 correct diagnoses from a list of 10 based on presenting symptoms and clinical findings.", example: "Example: Chest pain in 50-year-old male" },
  { icon: "fas fa-pills", name: "Medication Matching", description: "Match microbes to their first-line treatments or medications to their therapeutic uses.", example: "Example: Match C. difficile → Oral vancomycin" },
  { icon: "fas fa-vial", name: "Lab Interpretation", description: "Interpret laboratory values and identify the most likely diagnosis or condition.", example: "Example: High MCV + Low B12 = B12 deficiency" },
  { icon: "fas fa-route", name: "Flowchart Completion", description: "Complete missing steps in biological or clinical pathways and processes.", example: "Example: Fill missing enzymes in glycolysis" },
  { icon: "fas fa-clipboard-check", name: "OSCE Scenarios", description: "Objective Structured Clinical Examination scenarios with detailed marking criteria.", example: "Example: Patient communication assessment" },
  { icon: "fas fa-spell-check", name: "Word Scrabble", description: "Identify medical terms using hints and letter selections for vocabulary building.", example: "Example: Control center of cell = Nucleus" },
];

export default function Home() {
  return (
    <div className="bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                  Transform Your Medical Study Materials into{" "}
                  <span className="text-primary-600">AI-Powered Quizzes</span>
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed">
                  Upload PDFs, PowerPoints, or paste text content. Our Gemini AI analyzes your materials and generates comprehensive medical quizzes with 12+ question formats.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/create-quiz">
                  <Button size="lg" className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 shadow-lg hover:shadow-xl">
                    <i className="fas fa-plus mr-2"></i>
                    Create Your First Quiz
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <i className="fas fa-play mr-2"></i>
                  Watch Demo
                </Button>
              </div>
              
              <div className="flex items-center space-x-6 pt-4">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-check-circle text-success-500"></i>
                  <span className="text-slate-600">12+ Question Types</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fas fa-check-circle text-success-500"></i>
                  <span className="text-slate-600">AI-Powered Analysis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fas fa-check-circle text-success-500"></i>
                  <span className="text-slate-600">Instant Feedback</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <Card className="shadow-2xl border border-slate-200">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">Sample Medical Quiz</h3>
                    <Badge variant="secondary">Question 3/10</Badge>
                  </div>
                  
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-slate-800 font-medium mb-4">
                      A 45-year-old patient presents with chest pain, diaphoresis, and shortness of breath. What are the three most likely differential diagnoses?
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {["Myocardial Infarction", "Pulmonary Embolism", "Gastroesophageal Reflux", "Anxiety Attack"].map((option, idx) => (
                        <label key={idx} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-slate-200 hover:border-primary-300 cursor-pointer transition-colors">
                          <input type="checkbox" className="text-primary-600" />
                          <span className="text-slate-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <Button variant="ghost" className="text-slate-500 hover:text-slate-700">Previous</Button>
                    <Button className="bg-primary-600 hover:bg-primary-700">Next Question</Button>
                  </div>
                </CardContent>
              </Card>
              
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-purple-500 to-primary-600 text-white px-4 py-2 rounded-full shadow-lg">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-sparkles"></i>
                  <span className="text-sm font-semibold">AI Generated</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">
              Create Medical Quizzes in 3 Simple Steps
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Our AI-powered platform makes it easy to transform any medical content into comprehensive, interactive quizzes
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="text-center space-y-6">
              <div className="mx-auto w-20 h-20 bg-primary-100 rounded-2xl flex items-center justify-center">
                <i className="fas fa-upload text-primary-600 text-2xl"></i>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900">1. Upload Your Materials</h3>
                <p className="text-slate-600">
                  Upload PDFs, PowerPoint presentations, or paste text content directly. Our system supports multiple file formats for maximum flexibility.
                </p>
              </div>
              
              <Card className="bg-slate-50 border-2 border-dashed border-slate-300">
                <CardContent className="p-6 space-y-3">
                  <i className="fas fa-cloud-upload-alt text-slate-400 text-3xl"></i>
                  <p className="text-slate-600 text-sm">Drop files here or click to browse</p>
                  <div className="flex justify-center space-x-2">
                    <Badge variant="outline">PDF</Badge>
                    <Badge variant="outline">PPTX</Badge>
                    <Badge variant="outline">TXT</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="text-center space-y-6">
              <div className="mx-auto w-20 h-20 bg-success-100 rounded-2xl flex items-center justify-center">
                <i className="fas fa-brain text-success-600 text-2xl"></i>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900">2. AI Content Analysis</h3>
                <p className="text-slate-600">
                  Gemini AI analyzes your content, extracts key medical concepts, and identifies important terms for comprehensive quiz generation.
                </p>
              </div>
              
              <Card className="bg-slate-50">
                <CardContent className="p-6 text-left space-y-3">
                  <h4 className="font-semibold text-slate-900 text-sm">Key Concepts Identified:</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-primary-100 text-primary-700 hover:bg-primary-100">Cardiovascular System</Badge>
                    <Badge className="bg-primary-100 text-primary-700 hover:bg-primary-100">Myocardial Infarction</Badge>
                    <Badge className="bg-primary-100 text-primary-700 hover:bg-primary-100">ECG Interpretation</Badge>
                  </div>
                  <Card>
                    <CardContent className="p-3">
                      <p className="text-xs text-slate-600">Summary: Comprehensive overview of acute coronary syndromes, diagnostic criteria, and treatment protocols...</p>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </div>
            
            <div className="text-center space-y-6">
              <div className="mx-auto w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center">
                <i className="fas fa-magic text-purple-600 text-2xl"></i>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900">3. Generate Custom Quiz</h3>
                <p className="text-slate-600">
                  Configure your quiz preferences and let AI generate questions in 12+ medical formats, from differential diagnosis to OSCE scenarios.
                </p>
              </div>
              
              <Card className="bg-slate-50">
                <CardContent className="p-6 text-left space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-2">Quiz Type</label>
                    <select className="w-full p-2 border border-slate-300 rounded text-sm bg-white">
                      <option>Mixed Question Types</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-2">Number of Questions</label>
                    <input type="range" className="w-full" min="5" max="50" defaultValue="20" />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>5</span>
                      <span>20</span>
                      <span>50</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Question Types */}
      <section className="py-16 lg:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">
              12+ Medical Question Formats
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Comprehensive question types designed specifically for medical education and board exam preparation
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {questionTypes.map((type, idx) => (
              <Card key={idx} className="shadow-lg hover:shadow-xl transition-shadow border border-slate-200">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <i className={`${type.icon} text-primary-600`}></i>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">{type.name}</h3>
                  </div>
                  <p className="text-slate-600 text-sm">{type.description}</p>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-700 font-medium">{type.example}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/create-quiz">
              <Button size="lg" className="bg-primary-600 hover:bg-primary-700 shadow-lg">
                Explore All Question Types
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl lg:text-4xl font-bold text-white">
                Ready to Transform Your Medical Education?
              </h2>
              <p className="text-xl text-primary-100">
                Join thousands of medical students and professionals using AI-powered quizzes to accelerate their learning and improve exam performance.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/create-quiz">
                <Button size="lg" className="bg-white hover:bg-slate-50 text-primary-700 shadow-lg hover:shadow-xl">
                  Get Started Free
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-primary-700">
                Contact Sales
              </Button>
            </div>
            
            <div className="flex justify-center items-center space-x-8 pt-8">
              <div className="flex items-center space-x-2">
                <i className="fas fa-check text-primary-200"></i>
                <span className="text-primary-100">Free to start</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="fas fa-check text-primary-200"></i>
                <span className="text-primary-100">No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="fas fa-check text-primary-200"></i>
                <span className="text-primary-100">Instant access</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

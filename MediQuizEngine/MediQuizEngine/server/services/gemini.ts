import { GoogleGenAI } from "@google/genai";
import type { ContentAnalysis, Question } from "@shared/schema";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "" });

export async function analyzeContent(text: string): Promise<ContentAnalysis> {
  const systemPrompt = `You are a medical education expert. Analyze the provided medical content and extract:
1. A comprehensive summary of the content
2. Key medical concepts and topics covered
3. Important medical terms and terminology
4. Main subject areas

Respond with JSON in the specified format.`;

  const prompt = `Analyze this medical content and provide a structured analysis:

${text}

Focus on identifying:
- Main medical concepts and pathways
- Clinical terminology and definitions  
- Disease processes and mechanisms
- Treatment approaches and protocols
- Diagnostic criteria and procedures`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            keyConcepts: { 
              type: "array",
              items: { type: "string" }
            },
            medicalTerms: {
              type: "array", 
              items: { type: "string" }
            },
            topics: {
              type: "array",
              items: { type: "string" }
            }
          },
          required: ["summary", "keyConcepts", "medicalTerms", "topics"]
        }
      },
      contents: prompt,
    });

    const rawJson = response.text;
    if (rawJson) {
      const analysis: ContentAnalysis = JSON.parse(rawJson);
      return analysis;
    } else {
      throw new Error("Empty response from Gemini");
    }
  } catch (error) {
    console.error("Content analysis error:", error);
    throw new Error(`Failed to analyze content: ${error}`);
  }
}

// Optimized version with progress updates
export async function generateQuizWithProgress(
  content: string,
  analysis: ContentAnalysis,
  config: { questionCount: number; questionTypes: string[]; difficulty?: string; focusAreas?: string[] },
  onProgress?: (stage: string, progress: number, message: string) => void
): Promise<Question[]> {
  const batchSize = Math.min(5, config.questionCount); // Process in smaller batches
  const totalBatches = Math.ceil(config.questionCount / batchSize);
  const allQuestions: Question[] = [];

  for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
    const startIndex = batchIndex * batchSize;
    const endIndex = Math.min(startIndex + batchSize, config.questionCount);
    const questionsInBatch = endIndex - startIndex;
    
    const progress = 35 + Math.round((batchIndex / totalBatches) * 40); // 35-75% range
    onProgress?.('generation', progress, `Generating questions ${startIndex + 1}-${endIndex} of ${config.questionCount}...`);
    
    const batchQuestions = await generateQuestionBatch(
      content, 
      analysis, 
      { ...config, questionCount: questionsInBatch }, 
      startIndex
    );
    
    allQuestions.push(...batchQuestions);
  }

  return allQuestions;
}

// Keep original function for backwards compatibility
export async function generateQuiz(
  content: string,
  analysis: ContentAnalysis,
  config: { questionCount: number; questionTypes: string[]; difficulty?: string; focusAreas?: string[] }
): Promise<Question[]> {
  return generateQuizWithProgress(content, analysis, config);
}

async function generateQuestionBatch(
  content: string,
  analysis: ContentAnalysis,
  config: { questionCount: number; questionTypes: string[]; difficulty?: string; focusAreas?: string[] },
  startIndex: number = 0
): Promise<Question[]> {
  const systemPrompt = `You are an expert medical educator and quiz generator. Create comprehensive medical quiz questions based on the provided content and analysis.

Generate questions in these specific medical formats:

1. DIFFERENTIAL DIAGNOSIS: Choose 3 correct diagnoses from 10 options based on clinical presentation
2. QUICK DIAGNOSIS: Choose most likely diagnosis from 4 options given clinical scenario  
3. MEDICATION MATCHING: Match 4 microbes to 4 treatments or medications to therapeutic uses
4. LAB INTERPRETATION: Interpret lab values and identify most likely diagnosis
5. SHORT FACTS: Choose correct answer from 4 options for factual questions
6. FLOWCHART COMPLETION: Complete missing steps in biological/clinical pathways
7. WORD SCRAMBLE: Identify medical term using hint and letter selection
8. FIRST-LINE TREATMENT: Choose best first-line treatment from 4 options
9. MULTIPLE CHOICE: Standard multiple choice with 4 options
10. TRUE/FALSE: True or false medical statements
11. FILL IN BLANK: Complete medical statements with correct terms
12. OSCE: Clinical scenarios with marking schemes

Each question must include:
- Clear clinical context and realistic scenarios
- Appropriate difficulty level
- Detailed explanations for learning
- Proper medical terminology
- Evidence-based correct answers

Return an array of question objects in the specified JSON format.`;

  const questionTypesStr = config.questionTypes.join(", ");
  const focusAreasStr = config.focusAreas ? config.focusAreas.join(", ") : "all topics";

  const prompt = `Based on this medical content and analysis, generate ${config.questionCount} medical quiz questions.

CONTENT:
${content}

ANALYSIS:
Summary: ${analysis.summary}
Key Concepts: ${analysis.keyConcepts.join(", ")}
Medical Terms: ${analysis.medicalTerms.join(", ")}
Topics: ${analysis.topics.join(", ")}

REQUIREMENTS:
- Question types to include: ${questionTypesStr}
- Focus areas: ${focusAreasStr}
- Difficulty level: ${config.difficulty || "mixed"}
- Total questions: ${config.questionCount}

Generate diverse, clinically relevant questions that test understanding of the medical concepts. Ensure questions are:
- Medically accurate and current
- Appropriate for medical education
- Clear and unambiguous
- Realistic clinical scenarios
- Evidence-based answers

For differential diagnosis questions, provide 10 realistic options with 3 correct answers.
For medication matching, ensure accurate drug-indication pairings.
For lab interpretation, use realistic values and reference ranges.
For OSCE questions, include detailed marking schemes with keywords.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Use faster model for better speed
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              type: { type: "string" },
              question: { type: "string" },
              explanation: { type: "string" },
              difficulty: { type: "string" },
              // Additional properties will be validated by the union schema
            },
            required: ["id", "type", "question"]
          }
        }
      },
      contents: prompt,
    });

    const rawJson = response.text;
    if (rawJson) {
      const questions = JSON.parse(rawJson);
      // Add unique IDs if not provided
      return questions.map((q: any, index: number) => ({
        ...q,
        id: q.id || `q_${Date.now()}_${startIndex + index}`,
      }));
    } else {
      throw new Error("Empty response from Gemini");
    }
  } catch (error) {
    console.error("Quiz generation error:", error);
    throw new Error(`Failed to generate quiz: ${error}`);
  }
}

export async function analyzeFileContent(fileBuffer: Buffer, mimeType: string): Promise<string> {
  try {
    const contents = [
      {
        inlineData: {
          data: fileBuffer.toString("base64"),
          mimeType: mimeType,
        },
      },
      `Extract and transcribe all text content from this medical document. 
      Focus on:
      - Medical terminology and concepts
      - Clinical information and procedures  
      - Diagnostic criteria and guidelines
      - Treatment protocols and medications
      - Anatomical and physiological details
      
      Provide the complete text content in a structured, readable format.`,
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Use faster model for file analysis
      contents: contents,
    });

    return response.text || "";
  } catch (error) {
    console.error("File analysis error:", error);
    throw new Error(`Failed to analyze file: ${error}`);
  }
}

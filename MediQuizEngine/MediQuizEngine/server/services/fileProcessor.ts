import * as fs from "fs";
import * as path from "path";

export interface ProcessedFile {
  text: string;
  metadata: {
    filename: string;
    size: number;
    type: string;
  };
}

export async function processUploadedFile(file: any): Promise<ProcessedFile> {
  const { originalname, mimetype, size, buffer } = file;

  try {
    let extractedText = "";

    if (mimetype === "text/plain") {
      extractedText = buffer.toString("utf-8");
    } else if (mimetype === "application/pdf" || 
               mimetype === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
               mimetype.startsWith("image/")) {
      // For binary files, we'll use Gemini's multimodal capabilities
      const { analyzeFileContent } = await import("./gemini");
      extractedText = await analyzeFileContent(buffer, mimetype);
    } else {
      throw new Error(`Unsupported file type: ${mimetype}`);
    }

    return {
      text: extractedText,
      metadata: {
        filename: originalname,
        size,
        type: mimetype,
      },
    };
  } catch (error) {
    console.error("File processing error:", error);
    throw new Error(`Failed to process file: ${error}`);
  }
}

export function validateFileUpload(file: any): void {
  const allowedTypes = [
    "text/plain",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "image/jpeg",
    "image/png",
    "image/gif",
  ];

  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error(`File type ${file.mimetype} not supported. Allowed types: PDF, PPTX, TXT, JPG, PNG, GIF`);
  }

  if (file.size > maxSize) {
    throw new Error(`File size exceeds 10MB limit`);
  }
}

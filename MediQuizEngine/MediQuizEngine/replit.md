# MediQuiz Pro

## Overview

MediQuiz Pro is a web application designed to help medical students and professionals create interactive quizzes from their study materials using AI. The platform allows users to upload PDFs, PowerPoint presentations, or paste text content, which is then analyzed by Google's Gemini AI to generate comprehensive medical quizzes with multiple question formats including differential diagnosis, lab interpretation, medication matching, and OSCE scenarios.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with Vite as the build tool and development server
- **UI Components**: ShadCN UI library with Radix UI primitives
- **Styling**: Tailwind CSS with custom design system using CSS variables
- **Routing**: Wouter for client-side routing
- **State Management**: React Context for authentication, React Query for server state, and local storage for quiz persistence
- **Type Safety**: TypeScript with strict configuration and shared types

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **API Design**: RESTful endpoints for content analysis, file upload, and quiz generation
- **File Processing**: Multer for file uploads with support for PDF, PPTX, text, and image files
- **Storage**: In-memory storage implementation with interface for future database integration
- **Error Handling**: Centralized error handling middleware with structured error responses

### Data Storage Solutions
- **Database ORM**: Drizzle ORM configured for PostgreSQL with migrations support
- **Schema Design**: Normalized tables for users, quizzes, and quiz attempts with JSON fields for flexible content storage
- **Local Storage**: Browser localStorage for quiz persistence and offline capability
- **Session Management**: Express sessions with PostgreSQL session store

### Authentication and Authorization
- **User Management**: Simple username/password authentication with password hashing
- **Session Storage**: Server-side sessions stored in PostgreSQL using connect-pg-simple
- **Route Protection**: Middleware-based route protection for authenticated endpoints

## External Dependencies

### AI Services
- **Google Gemini AI**: Primary AI service for content analysis and quiz generation using @google/genai SDK
- **Multimodal Capabilities**: Support for text, PDF, image, and presentation analysis through Gemini's multimodal API

### Database
- **PostgreSQL**: Primary database using Neon serverless PostgreSQL via @neondatabase/serverless
- **Connection Management**: Environment-based database URL configuration with connection pooling

### Third-Party Libraries
- **File Processing**: PDF and PPTX parsing capabilities through client-side and server-side processing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Drag & Drop**: React Dropzone for intuitive file upload experience
- **Date Handling**: date-fns for date formatting and manipulation

### Development Tools
- **Build System**: Vite with React plugin and ESBuild for production builds
- **Development**: Hot module replacement with Vite dev server
- **Code Quality**: TypeScript strict mode with path aliases for clean imports
- **Replit Integration**: Development banner and cartographer plugin for Replit environment
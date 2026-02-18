# Website UX Reviewer

An AI-powered web application that analyzes websites and provides comprehensive UX reviews with actionable recommendations.

## 🚀 Live Demo

- **Frontend:** https://website-ux-reviewer.vercel.app
- **Backend API:** https://website-ux-reviewer.onrender.com

## ✨ Features

### Core Features
- **URL Analysis:** Paste any website URL for instant UX review
- **AI-Powered Review:** 8-12 categorized issues (clarity, layout, navigation, accessibility, trust)
- **Visual Proof:** Screenshots and text references for each issue
- **Top 3 Issues:** Before/after suggestions with detailed impact analysis
- **Review History:** View last 5 reviews stored in database
- **UX Score:** Overall score (0-100) with color-coded display

### Additional Features
- **Compare URLs:** Side-by-side comparison of two websites
- **Export to PDF:** Print-friendly export functionality
- **System Status:** Health checks for backend, database, LLM, and screenshot services
- **Input Validation:** Proper error handling for invalid URLs

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- React Router (navigation)
- Axios (API calls)

**Backend:**
- Node.js with Express
- TypeScript
- PostgreSQL (database)
- TypeORM (ORM)
- Playwright (web scraping & screenshots)
- Google Gemini 2.5 Flash (LLM)

### Design Principles
- **SOLID Principles:** Clean architecture with clear separation of concerns
- **Dependency Injection:** Service layer abstraction via Context API
- **Repository Pattern:** Database abstraction layer
- **Interface-based Design:** Loose coupling between components

## 🚀 How to Run Locally

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Google Gemini API Key

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials:
# PORT=3000
# DATABASE_URL=postgresql://user:password@localhost:5432/ux_reviewer
# GEMINI_API_KEY=your_gemini_api_key

# Run database migrations (TypeORM auto-creates tables)
npm run dev

# Backend will start on http://localhost:3000

# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env.local
echo "VITE_API_URL=http://localhost:3000" > .env.local

# Start development server
npm run dev

# Frontend will start on http://localhost:5173
Access the Application
Open browser: http://localhost:5173

Test with any website URL (e.g., https://example.com)

📝 What is Done
✅ Core Requirements:

Paste website link with validation

Web scraping (title, headings, forms, buttons, text)

Screenshot capture with Playwright

8-12 issues grouped by 5 categories

"Why this is an issue" explanation for each

Text proof for each issue

Before/after suggestions for top 3 issues

Database storage of last 5 reviews

History page with review listing

✅ Additional Features:

Overall UX score (0-100)

Compare two URLs side-by-side

Export review to PDF

System status page with health checks

Input validation and error handling

Professional UI with Tailwind CSS

Responsive design

✅ Best Practices:

SOLID principles throughout

Dependency Injection pattern

Repository pattern for database

Error handling and logging

Environment-based configuration

Type safety with TypeScript

Clean architecture

❌ What is Not Done
❌ Screenshot snippets highlighting specific elements (using text proof instead)

🔧 Environment Variables
Backend (.env)
text
PORT=3000
DATABASE_URL=postgresql://user:password@host:port/database
GEMINI_API_KEY=your_gemini_api_key
NODE_ENV=development
Frontend (.env.local)
text
VITE_API_URL=http://localhost:3000
📚 API Endpoints
text
POST   /api/v1/review              # Create new review
GET    /api/v1/reviews             # Get last 5 reviews
GET    /api/v1/review/:id          # Get review by ID
GET    /api/v1/health              # Basic health check
GET    /api/v1/health/llm          # LLM service health
GET    /api/v1/health/database     # Database health
GET    /api/v1/health/screenshot   # Screenshot service health
🐛 Known Issues
Review process takes 1-2 minutes due to web scraping and LLM analysis

Screenshots returned as base64 (larger payload size)

Limited to text-based proof (no visual element highlighting)

Free tier LLM limits (rate limiting may occur)

📄 License
This project is for assignment/demonstration purposes.

👤 Author
Avyay Khaire

See ABOUTME.md for more details.

# Prompts Used for App Development

Key prompts used during development. AI responses and API keys excluded.

---

## Project Setup

Build a Website UX Reviewer app with React + TypeScript frontend, Node.js + Express backend, PostgreSQL.
Requirements: paste URL, scrape content, generate 8-12 UX issues with categories, show top 3 with before/after, save last 5 reviews.
Use SOLID principles, Dependency Injection, Repository pattern.

---

## Backend Development

Create TypeORM entity for Review with: id, url, title, score, issues (JSON), topThreeIssues (JSON), extractedContent (JSON), screenshotPath, createdAt.
Include repository with CRUD

Integrate Google Gemini 1.5 Flash API.
Input: Website content (title, headings, forms, buttons, text)
Output: JSON with 8-12 issues (title, description, whyIssue, proof, category), top 3 with beforeSuggestion/afterSuggestion, score (0-100).

Create Playwright service to:

Navigate to URL

Extract title, headings, forms, buttons, main text

Capture full-page screenshot
Handle errors for invalid URLs and timeouts.

reate Express routes:
POST /api/v1/review - Create review
GET /api/v1/reviews - Last 5 reviews
GET /api/v1/review/:id - Get by ID
GET /api/v1/health/* - Health checks

## Frontend Development

Create reusable React components with TypeScript + Tailwind:
Button (variants: primary, secondary), Input (with validation), Card, LoadingSpinner, ErrorMessage.

Create ReviewPage displaying:

Title, URL, date, score

Screenshot

Top 3 issues with before/after suggestions

All issues grouped by category

Export to PDF button

Create HistoryPage:

Fetch last 5 reviews

Display cards with score, URL, thumbnail

Click to view full review

Loading and error states

Create ComparePage:

Two URL inputs

Side-by-side: scores, screenshots, top 3 issues, issue counts

Analyze both URLs sequentially
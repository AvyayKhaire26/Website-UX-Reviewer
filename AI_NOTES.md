# AI Usage Notes

## AI Tools Used

### Primary AI Assistant: Perplexity AI
- Used for: Architecture design, code generation, debugging, best practices
- Throughout: Entire development process

## What AI Was Used For

### 1. Architecture & Design
- ✅ SOLID principles implementation
- ✅ Dependency Injection pattern setup
- ✅ Repository pattern design
- ✅ Service layer architecture
- ✅ TypeScript interface design
- ✅ Folder structure organization

**Verification:** Manually reviewed all architectural decisions, ensured proper separation of concerns, tested DI container functionality.

### 2. Backend Development
- ✅ Express.js setup with TypeScript
- ✅ TypeORM entity definitions
- ✅ Controller implementations
- ✅ Service layer logic
- ✅ Repository methods
- ✅ Route definitions
- ✅ CORS configuration
- ✅ Middleware setup

**Verification:** Tested all API endpoints with Postman, verified database operations, checked error handling, validated response structures.

### 3. Frontend Development
- ✅ React component structure
- ✅ TypeScript types/interfaces
- ✅ Custom hooks implementation
- ✅ Context API setup (DI)
- ✅ Routing configuration
- ✅ UI components with Tailwind
- ✅ Form validation logic

**Verification:** Manually tested all UI interactions, verified type safety, tested edge cases, ensured responsive design.

### 4. LLM Integration
- ✅ Google Gemini API integration
- ✅ Prompt engineering for UX analysis
- ✅ Response parsing logic
- ✅ Error handling for API failures

**Verification:** Tested with multiple websites, validated response format consistency, ensured proper error handling, verified issue categorization accuracy.

### 5. Web Scraping & Screenshots
- ✅ Playwright setup
- ✅ Content extraction logic
- ✅ Screenshot capture
- ✅ Base64 conversion

**Verification:** Tested with various website types, verified screenshot quality, checked content extraction accuracy.

### 6. Deployment & DevOps
- ✅ Render deployment configuration
- ✅ Vercel deployment setup
- ✅ Environment variable management
- ✅ CORS troubleshooting
- ✅ Build optimization

**Verification:** Tested production deployments, verified environment variables, checked API connectivity, ensured CORS working correctly.

## What I Verified/Checked Myself

### 1. Business Logic
- ✅ UX review categories (clarity, layout, navigation, accessibility, trust)
- ✅ Issue severity levels
- ✅ Scoring algorithm logic
- ✅ Top 3 issues selection criteria

### 2. Database Design
- ✅ Review entity schema
- ✅ Relationship definitions
- ✅ Index optimization
- ✅ Data retention policy (last 5 reviews)

### 3. Security
- ✅ Environment variable usage (no hardcoded secrets)
- ✅ CORS configuration
- ✅ Input validation
- ✅ SQL injection prevention (TypeORM parameterized queries)

### 4. User Experience
- ✅ UI/UX flow
- ✅ Loading states
- ✅ Error messages clarity
- ✅ Responsive design breakpoints
- ✅ Color schemes and accessibility

### 5. Testing & Validation
- ✅ End-to-end testing of all features
- ✅ Edge case handling
- ✅ Error scenario testing
- ✅ Performance monitoring
- ✅ Production deployment verification

### 6. Code Quality
- ✅ TypeScript type safety
- ✅ Code organization
- ✅ Naming conventions
- ✅ Comment quality
- ✅ DRY principle adherence

## LLM Choice & Reasoning

### Primary LLM: Google Gemini 2.5 Flash

**Why Gemini 2.5 Flash?**

1. **Free Tier:** 15 requests per minute, sufficient for MVP
2. **Fast Response:** ~2-3 minutes for UX analysis
3. **Good Quality:** Structured output with consistent formatting
4. **Context Window:** 1M tokens - handles large web content
5. **Cost-Effective:** Free tier meets project requirements
6. **JSON Output:** Supports structured responses
7. **Availability:** No waitlist, instant API access

**Alternatives Considered:**

| LLM | Pros | Cons | Decision |
|-----|------|------|----------|
| **GPT-4** | Best quality | Expensive, requires billing | ❌ Too costly |
| **GPT-3.5** | Fast, affordable | Quality inconsistent | ❌ Gemini better |
| **Claude 3** | Good quality | Limited free tier | ❌ Gemini more accessible |
| **Llama 3** | Open source | Requires self-hosting | ❌ Infrastructure overhead |
| **Gemini Pro** | Better quality | Rate limits stricter | ❌ Flash sufficient |

**Prompt Engineering Approach:**

System: UX expert analyzing websites
Task: Identify 8-12 issues across 5 categories
Output: Structured JSON with proof, recommendations

**Verification of LLM Output:**
- ✅ Manually reviewed 10+ website analyses
- ✅ Verified issue categorization accuracy
- ✅ Checked recommendation relevance
- ✅ Validated JSON structure consistency
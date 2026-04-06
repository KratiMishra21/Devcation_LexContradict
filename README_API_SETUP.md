# LexContradict - React Frontend with API Integration

This is a fully functional React/Next.js frontend for the LexContradict legal contradiction detection system. It's now fully connected to a real backend API.

## Setup Instructions

### 1. Environment Configuration

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_API_BASE=http://localhost:8000
```

For production, update this to your backend API URL:
```bash
NEXT_PUBLIC_API_BASE=https://your-api-domain.com
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Run the Development Server

```bash
pnpm dev
```

The app will start at `http://localhost:3000`

## API Integration

The frontend connects to your backend API and expects the following endpoints:

### GET /contradictions
Returns a list of all contradictions found in uploaded documents.

**Response Format:**
```json
{
  "contradictions": [
    {
      "contradiction_id": "con001",
      "conflict_reason": "Mehta claims Delhi but CCTV places him in Mumbai",
      "conflict_type": "location",
      "severity": "critical",
      "confidence": 0.94,
      "ai_analysis": "This directly contradicts his alibi...",
      "claim_a": {
        "claim_id": "d1c01",
        "entity": "Rajesh Mehta",
        "raw_text": "I was present at our Delhi headquarters",
        "source_doc": "mehta_deposition.txt",
        "page_ref": "Page 14"
      },
      "claim_b": {
        "claim_id": "d2c03",
        "entity": "CCTV System",
        "raw_text": "Badge scan at Mumbai office 10:42am",
        "source_doc": "exhibits_bundle.txt",
        "page_ref": "Entry 2847"
      }
    }
  ],
  "summary": {
    "total_contradictions": 6,
    "critical": 2,
    "high": 2,
    "medium": 2,
    "total_claims": 18,
    "documents_processed": 3
  }
}
```

### POST /upload
Uploads and processes a document.

**Request:**
- Content-Type: multipart/form-data
- Body: Form with file field containing the document

**Response:**
```json
{
  "claims_found": 8,
  "contradictions_found": 3,
  "message": "Document processed successfully"
}
```

### POST /ask
Provides AI-powered answers about contradictions.

**Request Body:**
```json
{
  "question": "What contradictions involve John Smith?"
}
```

**Response:**
```json
{
  "answer": "John Smith appears in 2 critical contradictions..."
}
```

## Features Implemented

✅ **Document Upload** - Upload documents with real-time processing
✅ **Dynamic Contradictions Tab** - Cards render from API data with:
  - Severity badges (Critical/High/Medium)
  - Side-by-side claim comparison with VS badge
  - Confidence bars
  - AI analysis
  - Filter chips for severity levels

✅ **Graph View** - Interactive node graph showing:
  - Entity nodes (purple)
  - Claim nodes (red for conflicting, tan for regular)
  - Location nodes (amber)
  - Document nodes (blue)
  - Conflict edges (red dashed)
  - Normal edges (gray)

✅ **All Claims Table** - Comprehensive table with:
  - Entity column
  - Claim text
  - Source document
  - Status badges (Contradicted/Verified/Corroborated)

✅ **Chat Bar** - AI-powered Q&A with:
  - Real API calls to /ask endpoint
  - Typing indicators during loading
  - Error handling
  - Context-aware responses

✅ **Sidebar** - Shows:
  - File upload area with visual feedback
  - Document list with contradiction counts
  - Real-time stats (total contradictions, critical count, documents, claims)

✅ **Error Handling**:
  - User-friendly error messages
  - Loading states with spinners
  - Empty state before upload
  - Skeleton loading for large datasets

## Data Flow

1. User uploads a document via sidebar upload area
2. API processes the document (POST /upload)
3. Frontend automatically fetches latest contradictions (GET /contradictions)
4. Cards render dynamically from API response
5. User can filter by severity or ask questions
6. Chat questions call POST /ask for AI analysis

## Styling & Design

- **Dark Theme**: Professional legal aesthetic with dark neutral colors
- **Color Palette**: Red (#d32f2f), Purple (#6b5b95), Coral (#e74c3c), Amber (#f39c12), Blue (#3498db)
- **Responsive**: Works on all screen sizes
- **Accessible**: Semantic HTML, ARIA labels, keyboard navigation

## Troubleshooting

**"Failed to fetch"?**
- Check if your backend API is running
- Verify `NEXT_PUBLIC_API_BASE` in `.env.local` matches your API URL
- Check CORS settings on your backend

**No contradictions showing?**
- Upload a document first using the sidebar
- Check browser console for API errors
- Verify your backend is returning the correct response format

**Chat not working?**
- Check network tab in browser DevTools
- Verify POST /ask endpoint is implemented on backend
- Check response format matches expected JSON

## Production Deployment

1. Build the project:
   ```bash
   pnpm build
   ```

2. Set environment variables on Vercel:
   - `NEXT_PUBLIC_API_BASE`: Your production API URL

3. Deploy to Vercel:
   ```bash
   pnpm deploy
   ```

## Architecture

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS v4 with custom design tokens
- **State Management**: React hooks (useState, useEffect, useMemo)
- **Icons**: Lucide React
- **Type Safety**: Full TypeScript

The app uses a client-side fetching pattern with proper error handling, loading states, and automatic data transformation from API responses to component props.

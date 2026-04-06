# LexContradict

A modern legal contradiction detection system that analyzes documents to identify inconsistencies, conflicts, and contradictions using advanced AI-powered analysis.

## Authors

- **Gungun Jain**
- **Krati Mishra**

## Overview

LexContradict is a comprehensive web application designed to detect and analyze contradictions in legal documents, witness statements, depositions, and exhibits. The system provides an intuitive interface for document management, contradiction analysis, and visual representation of conflicts.

## Features

- **Document Management**: Upload and organize legal documents in a structured folder system
- **Contradiction Detection**: AI-powered analysis to identify logical and factual contradictions
- **Multi-Source Analysis**: Compare statements across depositions, witnesses, and exhibits
- **Timeline View**: Visual representation of events and contradictions over time
- **Graph Visualization**: Network graph showing relationships between contradictions
- **Smart Search**: Filter and search contradictions by type, severity, and confidence
- **Chat Interface**: Interactive Q&A about detected contradictions
- **Dark/Light Theme**: Customizable UI with theme support
- **Real-time Updates**: Live updates as documents are analyzed

## Tech Stack

### Frontend
- **Next.js 16** - React framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component library
- **React Hook Form** - Form state management
- **Lucide React** - Icon library

### Backend
- **Python** - Core language
- **FastAPI** - REST API framework
- **Anthropic Claude** - AI-powered contradiction detection

### Data Processing
- **Document extraction and parsing**
- **Text analysis and NLP**
- **Contradiction scoring and ranking**

## Project Structure

```
Devcation_LexContradict/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # UI component library
│   ├── sidebar.tsx       # Navigation sidebar
│   ├── chat-bar.tsx      # Chat interface
│   ├── graph-view.tsx    # Graph visualization
│   ├── timeline-view.tsx # Timeline view
│   └── ...
├── extractor/            # Python backend
│   ├── main.py          # Entry point
│   ├── extractor.py     # Document extraction
│   ├── reader.py        # Document reading
│   ├── prompts.py       # AI prompts
│   └── test.py          # Tests
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
├── types/              # TypeScript definitions
├── public/             # Static assets
└── styles/             # CSS stylesheets
```

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Python 3.9+
- API backend running locally or on a server

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Devcation_LexContradict
   ```

2. **Install frontend dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Configuration**
   
   Create a `.env.local` file in the project root:
   ```bash
   NEXT_PUBLIC_API_BASE=http://localhost:8000
   ```
   
   For production, update with your API URL:
   ```bash
   NEXT_PUBLIC_API_BASE=https://your-api-domain.com
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```
   
   The application will be available at `http://localhost:3000`

### Building for Production

```bash
pnpm build
pnpm start
```

## API Integration

The frontend connects to a backend API that provides:

- **GET /contradictions** - Retrieve detected contradictions
- **POST /analyze** - Submit documents for analysis
- **GET /documents** - List uploaded documents
- **POST /search** - Search within documents and contradictions

For detailed API documentation, see [README_API_SETUP.md](README_API_SETUP.md).

## Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

### Code Style

This project uses:
- **ESLint** for code linting
- **TypeScript** for type safety
- **Tailwind CSS** for consistent styling
- **Radix UI** for accessible components

## Features in Detail

### Document Management
Upload and organize legal documents in a hierarchical folder structure. Support for multiple document types including depositions, witness statements, and exhibits.

### Contradiction Detection
The AI system analyzes document content to identify:
- Location contradictions
- Timeline conflicts
- Factual inconsistencies
- Contradictory statements

### Visualization Tools
- **Graph View**: Interactive network diagram showing contradiction relationships
- **Timeline View**: Chronological representation of events and detected conflicts
- **Claims Tab**: Organized view of all statements and claims
- **Contradictions Tab**: Detailed analysis of identified contradictions

### Chat Interface
Interactive chat for asking questions about detected contradictions and document content.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Contact

For questions or support, please contact:
- Gungun Jain
- Krati Mishra

---

**Last Updated**: April 2026

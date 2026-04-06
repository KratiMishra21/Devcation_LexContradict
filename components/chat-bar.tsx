'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';

interface ChatBarProps {
  onAsk: (question: string) => Promise<string | null>;
}

export function ChatBar({ onAsk }: ChatBarProps) {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) return;

    setIsLoading(true);
    const currentQuestion = question;
    setQuestion('');

    try {
      const answer = await onAsk(currentQuestion);
      if (answer) {
        setResponse(answer);
      }
    } catch (error) {
      setResponse('Failed to get response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border-t border-border bg-card">
      <div className="max-w-6xl mx-auto p-4 space-y-3">
        {response && (
          <div className="bg-muted/50 p-3 rounded-lg border border-border">
            <p className="text-sm text-foreground">{response}</p>
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
            placeholder="Ask about contradictions, claims, documents..."
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          />
          <button
            onClick={handleAsk}
            disabled={!question.trim() || isLoading}
            className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Ask
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

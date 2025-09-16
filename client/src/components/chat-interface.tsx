import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User } from "lucide-react";
import type { Prediction } from "@shared/schema";

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  chatResponse: string;
  predictions: Prediction[];
  symptoms: string[];
  onFollowUp: (question: string) => Promise<void>;
  isLoading: boolean;
}

export function ChatInterface({ chatResponse, predictions, symptoms, onFollowUp, isLoading }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [followUpInput, setFollowUpInput] = useState("");
  const [followUpLoading, setFollowUpLoading] = useState(false);

  // Initialize with the main chat response
  useEffect(() => {
    if (chatResponse && messages.length === 0) {
      setMessages([
        {
          id: '1',
          type: 'user',
          content: `My dog has been experiencing: ${symptoms.join(', ')}`,
          timestamp: new Date()
        },
        {
          id: '2',
          type: 'ai',
          content: chatResponse,
          timestamp: new Date()
        }
      ]);
    }
  }, [chatResponse, symptoms, messages.length]);

  const handleFollowUpSubmit = async () => {
    if (!followUpInput.trim() || followUpLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: followUpInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setFollowUpInput("");
    setFollowUpLoading(true);

    try {
      await onFollowUp(followUpInput);
    } finally {
      setFollowUpLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleFollowUpSubmit();
    }
  };

  // Add AI response to messages when received
  useEffect(() => {
    if (chatResponse && messages.length > 0 && messages[messages.length - 1].type === 'user') {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: chatResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    }
  }, [chatResponse, messages]);

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-6 mb-6">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-foreground mb-2">AI Assessment</h3>
        <p className="text-muted-foreground">Our AI analyzes symptoms and provides guidance in plain English.</p>
      </div>

      <div className="space-y-4 min-h-[200px]" data-testid="chat-messages">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <p>Enter symptoms above to get an AI assessment</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              data-testid={`chat-message-${message.type}-${message.id}`}
            >
              {message.type === 'user' ? (
                <div className="chat-bubble-user text-primary-foreground px-6 py-4 rounded-2xl rounded-br-md max-w-lg shadow-sm">
                  <p className="font-medium">{message.content}</p>
                </div>
              ) : (
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Bot className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  <div className="chat-bubble-ai text-secondary-foreground px-6 py-4 rounded-2xl rounded-bl-md max-w-2xl shadow-sm">
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {/* Loading state for follow-up */}
        {followUpLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                <div className="w-5 h-5 border-2 border-secondary-foreground/20 border-t-secondary-foreground rounded-full animate-spin"></div>
              </div>
              <div className="bg-muted px-6 py-4 rounded-2xl rounded-bl-md">
                <p className="text-muted-foreground">
                  Thinking<span className="loading-dots">...</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Follow-up Input */}
      {messages.length > 0 && (
        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex space-x-3">
            <Input
              type="text"
              placeholder="Ask a follow-up question..."
              value={followUpInput}
              onChange={(e) => setFollowUpInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={followUpLoading}
              className="flex-1 p-3 bg-input border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-ring focus:outline-none transition-all duration-200"
              data-testid="input-follow-up"
            />
            <Button
              onClick={handleFollowUpSubmit}
              disabled={!followUpInput.trim() || followUpLoading}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              data-testid="button-send-follow-up"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

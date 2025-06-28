import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Bot, User, CheckCircle, Edit3 } from 'lucide-react';
import { toast } from 'sonner';
import { EmailDetailsConfirmation } from './EmailDetailsConfirmation';
import { EmailPreview } from './EmailPreview';
import { chatWithAssistant, confirmAndGenerate, reviseEmail, startNewConversation } from '@/services/emailAssistantApi';
import type { 
  EmailAssistantResponse, 
  ExtractedEmailDetails, 
  FollowUpQuestion,
  EmailContent
} from '@/services/emailAssistantApi';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  data?: EmailAssistantResponse;
}

export function EmailAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [currentResponse, setCurrentResponse] = useState<EmailAssistantResponse | null>(null);
  const [extractedDetails, setExtractedDetails] = useState<ExtractedEmailDetails | null>(null);
  const [generatedEmail, setGeneratedEmail] = useState<EmailContent | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize with a welcome message
    const welcomeMessage: Message = {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm your intelligent email assistant. I can help you create professional emails by having a natural conversation. Just tell me what kind of email you'd like to send, and I'll guide you through the process. For example, you could say: 'I need to write a follow-up email to a client about our meeting tomorrow.'",
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  const startNewChat = async () => {
    try {
      const response = await startNewConversation();
      setConversationId(response.conversation_id);
      setMessages([{
        id: '1',
        type: 'assistant',
        content: "Hi! I'm your intelligent email assistant. I can help you create professional emails by having a natural conversation. Just tell me what kind of email you'd like to send, and I'll guide you through the process.",
        timestamp: new Date()
      }]);
      setCurrentResponse(null);
      setExtractedDetails(null);
      setGeneratedEmail(null);
      setShowConfirmation(false);
      setShowEmailPreview(false);
    } catch (error) {
      toast.error('Failed to start new conversation');
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Start new conversation if needed
      let currentConversationId = conversationId;
      if (!currentConversationId) {
        const newConv = await startNewConversation();
        currentConversationId = newConv.conversation_id;
        setConversationId(currentConversationId);
      }

      const response = await chatWithAssistant({
        conversation_id: currentConversationId,
        user_message: inputValue
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.message,
        timestamp: new Date(),
        data: response
      };

      setMessages(prev => [...prev, assistantMessage]);
      setCurrentResponse(response);
      
      if (response.extracted_details) {
        setExtractedDetails(response.extracted_details);
      }

      if (response.requires_confirmation) {
        setShowConfirmation(true);
      }

      if (response.generated_email) {
        setGeneratedEmail(response.generated_email);
        setShowEmailPreview(true);
      }

    } catch (error) {
      toast.error('Failed to send message');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDetails = async (confirmedDetails: ExtractedEmailDetails) => {
    if (!conversationId) return;

    setIsLoading(true);
    try {
      const response = await confirmAndGenerate({
        conversation_id: conversationId,
        confirmed_details: confirmedDetails
      });

      const assistantMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: response.message,
        timestamp: new Date(),
        data: response
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (response.generated_email) {
        setGeneratedEmail(response.generated_email);
        setShowEmailPreview(true);
      }
      
      setShowConfirmation(false);
    } catch (error) {
      toast.error('Failed to generate email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviseEmail = async (feedback: string) => {
    if (!conversationId || !generatedEmail) return;

    setIsLoading(true);
    try {
      const response = await reviseEmail({
        conversation_id: conversationId,
        current_email: generatedEmail,
        feedback
      });

      const assistantMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: response.message,
        timestamp: new Date(),
        data: response
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (response.generated_email) {
        setGeneratedEmail(response.generated_email);
      }
    } catch (error) {
      toast.error('Failed to revise email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderFollowUpQuestions = (questions: FollowUpQuestion[]) => {
    return (
      <div className="mt-4 space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Quick responses:</p>
        <div className="flex flex-wrap gap-2">
          {questions.map((question, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => setInputValue(question.question)}
              className="text-xs"
            >
              {question.question}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] max-w-6xl mx-auto">
      {/* Chat Interface */}
      <div className="flex-1 flex flex-col min-h-0">
        <Card className="flex-1 flex flex-col h-full">
          <CardHeader className="flex-shrink-0 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Email Assistant
              </CardTitle>
              <Button variant="outline" size="sm" onClick={startNewChat}>
                New Chat
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0 min-h-0">
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex gap-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.type === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                        </div>
                        <div className={`rounded-lg p-3 ${
                          message.type === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}>
                          <p className="whitespace-pre-wrap">{message.content}</p>
                          {message.data?.follow_up_questions && renderFollowUpQuestions(message.data.follow_up_questions)}
                          {message.data?.missing_fields && message.data.missing_fields.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-medium mb-2">Missing information:</p>
                              <div className="flex flex-wrap gap-1">
                                {message.data.missing_fields.map((field, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {field}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>
            
            <Separator />
            
            <div className="p-4 flex-shrink-0">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={isLoading || !inputValue.trim()}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Side Panel */}
      <div className="w-80 ml-4 space-y-4 overflow-y-auto max-h-full">
        {/* Email Details Confirmation */}
        {showConfirmation && extractedDetails && (
          <EmailDetailsConfirmation
            details={extractedDetails}
            onConfirm={handleConfirmDetails}
            onCancel={() => setShowConfirmation(false)}
            isLoading={isLoading}
          />
        )}

        {/* Email Preview */}
        {showEmailPreview && generatedEmail && (
          <EmailPreview
            email={generatedEmail}
            onRevise={handleReviseEmail}
            isLoading={isLoading}
          />
        )}

        {/* Current Details Display */}
        {extractedDetails && !showConfirmation && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Current Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {extractedDetails.recipient && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Recipient:</span>
                  <p className="text-sm">{extractedDetails.recipient}</p>
                </div>
              )}
              {extractedDetails.purpose && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Purpose:</span>
                  <p className="text-sm">{extractedDetails.purpose}</p>
                </div>
              )}
              {extractedDetails.tone && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Tone:</span>
                  <p className="text-sm capitalize">{extractedDetails.tone}</p>
                </div>
              )}
              {extractedDetails.context && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Context:</span>
                  <p className="text-sm">{extractedDetails.context}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Mail, Edit3, Copy, Send, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import type { EmailContent } from '@/services/emailAssistantApi';

interface EmailPreviewProps {
  email: EmailContent;
  onRevise: (feedback: string) => void;
  isLoading?: boolean;
}

export function EmailPreview({ email, onRevise, isLoading = false }: EmailPreviewProps) {
  const [showRevisionInput, setShowRevisionInput] = useState(false);
  const [revisionFeedback, setRevisionFeedback] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleRevise = () => {
    if (!revisionFeedback.trim()) {
      toast.error('Please provide feedback for revision');
      return;
    }
    
    onRevise(revisionFeedback);
    setRevisionFeedback('');
    setShowRevisionInput(false);
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`${field} copied to clipboard`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const copyFullEmail = async () => {
    const fullEmail = `Subject: ${email.subject}\n\n${email.content}`;
    await copyToClipboard(fullEmail, 'Full email');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Generated Email
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Subject */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Subject</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(email.subject, 'Subject')}
              className="h-6 px-2"
            >
              {copiedField === 'Subject' ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
          <div className="bg-muted rounded-md p-3">
            <p className="text-sm font-medium">{email.subject}</p>
          </div>
        </div>

        <Separator />

        {/* Content */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Content</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(email.content, 'Content')}
              className="h-6 px-2"
            >
              {copiedField === 'Content' ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
          <div className="bg-muted rounded-md p-3 max-h-60 overflow-y-auto">
            <p className="text-sm whitespace-pre-wrap">{email.content}</p>
          </div>
        </div>

        {/* Email Metadata */}
        {(email.tone || email.language) && (
          <div className="flex gap-2">
            {email.tone && (
              <Badge variant="secondary" className="text-xs">
                {email.tone}
              </Badge>
            )}
            {email.language && (
              <Badge variant="outline" className="text-xs">
                {email.language.toUpperCase()}
              </Badge>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button
              onClick={copyFullEmail}
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
            >
              {copiedField === 'Full email' ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 mr-1" />
                  Copy All
                </>
              )}
            </Button>
            <Button
              onClick={() => setShowRevisionInput(!showRevisionInput)}
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              disabled={isLoading}
            >
              <Edit3 className="h-3 w-3 mr-1" />
              Revise
            </Button>
          </div>

          {/* Revision Input */}
          {showRevisionInput && (
            <div className="space-y-2 pt-2 border-t">
              <Textarea
                value={revisionFeedback}
                onChange={(e) => setRevisionFeedback(e.target.value)}
                placeholder="What would you like me to change? e.g., 'Make it more formal', 'Add a call to action', 'Shorten the content'..."
                className="text-sm min-h-[80px]"
                disabled={isLoading}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleRevise}
                  disabled={!revisionFeedback.trim() || isLoading}
                  size="sm"
                  className="flex-1 text-xs"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Revising...
                    </>
                  ) : (
                    'Apply Changes'
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setShowRevisionInput(false);
                    setRevisionFeedback('');
                  }}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Usage Tips */}
        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-md p-3">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            💡 <strong>Tip:</strong> You can copy the email content and paste it into your email client, or ask me to revise specific parts.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
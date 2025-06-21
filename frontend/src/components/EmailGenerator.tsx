
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Copy, Wand2 } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { EmailTemplate, generateEmail } from '@/services/emailApi';

interface EmailGeneratorProps {
  templates: EmailTemplate[];
  isLoading?: boolean;
}

const EmailGenerator = ({ templates, isLoading }: EmailGeneratorProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [context, setContext] = useState('');
  const [tone, setTone] = useState('professional');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [generatedSubject, setGeneratedSubject] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const toneOptions = [
    { value: 'professional', label: 'Professional' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'formal', label: 'Formal' },
    { value: 'casual', label: 'Casual' },
  ];

  const extractPlaceholders = (text: string): string[] => {
    const matches = text.match(/\{([^}]+)\}/g);
    return matches ? matches.map(match => match.slice(1, -1)) : [];
  };

  const handleGenerateEmail = async () => {
    if (!selectedTemplate || !context.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a template and provide context.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await generateEmail({
        purpose: selectedTemplate.purpose,
        context: context.trim(),
        tone,
        language: selectedTemplate.language,
      });

      // The API response structure may vary, adapt as needed
      setGeneratedSubject(response.subject || selectedTemplate.subject);
      setGeneratedEmail(response.content || response.email || 'Generated email content');
      
      toast({
        title: "Email Generated!",
        description: "Your email has been generated successfully.",
      });
    } catch (error) {
      console.error('Failed to generate email:', error);
      
      // Fallback to template-based generation if API fails
      let processedSubject = selectedTemplate.subject;
      let processedContent = selectedTemplate.content;
      
      // Simple placeholder replacement
      const contextData: Record<string, string> = {
        recipient_name: 'Dear Colleague',
        sender_name: 'Best regards',
        product_service: 'your services',
        specific_inquiry: 'your offerings and pricing',
        additional_context: context.trim(),
        meeting_topic: 'our upcoming project',
        meeting_context: context.trim(),
        duration: '30-minute',
        point_1: 'Pricing and packages',
        point_2: 'Timeline and delivery',
        point_3: 'Support and maintenance'
      };

      Object.entries(contextData).forEach(([key, value]) => {
        const placeholder = `{${key}}`;
        processedSubject = processedSubject.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
        processedContent = processedContent.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
      });

      setGeneratedSubject(processedSubject);
      setGeneratedEmail(processedContent);
      
      toast({
        title: "Email Generated (Offline)",
        description: "Generated using template. API temporarily unavailable.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Email content copied to clipboard.",
    });
  };

  const placeholders = selectedTemplate ? extractPlaceholders(selectedTemplate.content + selectedTemplate.subject) : [];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading templates...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Generate Email Template
          </CardTitle>
          <CardDescription>
            Select a template and provide context to generate a personalized email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="template-select">Select Template</Label>
            <Select onValueChange={(value) => {
              const template = templates.find(t => t.id.toString() === value);
              setSelectedTemplate(template || null);
            }}>
              <SelectTrigger id="template-select">
                <SelectValue placeholder="Choose an email template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id.toString()}>
                    {template.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTemplate && placeholders.length > 0 && (
            <div>
              <Label>Template Variables</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {placeholders.map((placeholder, index) => (
                  <Badge key={index} variant="secondary">
                    {placeholder}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="tone-select">Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger id="tone-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {toneOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="context">Context & Details</Label>
            <Textarea
              id="context"
              placeholder="Provide context for your email (e.g., purpose, recipient details, specific requirements, etc.)"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={4}
            />
          </div>

          <Button 
            onClick={handleGenerateEmail} 
            disabled={!selectedTemplate || !context.trim() || isGenerating}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isGenerating ? "Generating..." : "Generate Email"}
          </Button>
        </CardContent>
      </Card>

      {generatedEmail && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Email</CardTitle>
            <CardDescription>Your personalized email is ready</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Subject</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generatedSubject)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Input value={generatedSubject} readOnly className="bg-gray-50" />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Email Content</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generatedEmail)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                value={generatedEmail}
                readOnly
                rows={12}
                className="bg-gray-50"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmailGenerator;

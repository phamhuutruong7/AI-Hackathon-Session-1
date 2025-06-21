
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, MessageSquare, Languages, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import EmailGenerator from '@/components/EmailGenerator';
import EmailResponder from '@/components/EmailResponder';
import EmailTranslator from '@/components/EmailTranslator';
import TemplateManager from '@/components/TemplateManager';
import { getEmailTemplates, EmailTemplate } from '@/services/emailApi';
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const { data: templates = [], isLoading, error, refetch } = useQuery({
    queryKey: ['email-templates'],
    queryFn: () => getEmailTemplates(),
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load email templates. Using default templates.",
        variant: "destructive",
      });
    }
  }, [error]);

  // Fallback templates if API fails
  const fallbackTemplates: EmailTemplate[] = [
    {
      id: 1,
      title: 'Business Inquiry',
      subject: 'Inquiry about {product/service}',
      content: 'Dear {recipient_name},\n\nI hope this email finds you well. I am writing to inquire about {specific_inquiry}.\n\n{additional_context}\n\nI would appreciate if you could provide more information about:\n- {point_1}\n- {point_2}\n- {point_3}\n\nThank you for your time and consideration. I look forward to hearing from you soon.\n\nBest regards,\n{sender_name}',
      purpose: 'business_inquiry',
      language: 'en',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Meeting Request',
      subject: 'Meeting Request - {topic}',
      content: 'Dear {recipient_name},\n\nI hope you are doing well. I would like to schedule a meeting to discuss {meeting_topic}.\n\n{meeting_context}\n\nWould you be available for a {duration} meeting sometime next week? I am flexible with timing and can accommodate your schedule.\n\nPlease let me know what works best for you.\n\nBest regards,\n{sender_name}',
      purpose: 'meeting_request',
      language: 'en',
      is_active: true,
      created_at: new Date().toISOString()
    }
  ];

  const displayTemplates = error ? fallbackTemplates : templates;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full">
              <Mail className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Email Wizard
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your AI-powered email assistant for generating templates, writing responses, and translating messages
          </p>
        </div>

        {/* Main Content */}
        <Card className="max-w-6xl mx-auto shadow-xl border-0 bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <Tabs defaultValue="generate" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6 bg-gray-100/50">
                <TabsTrigger value="generate" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Generate
                </TabsTrigger>
                <TabsTrigger value="respond" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Respond
                </TabsTrigger>
                <TabsTrigger value="translate" className="flex items-center gap-2">
                  <Languages className="h-4 w-4" />
                  Translate
                </TabsTrigger>
                <TabsTrigger value="templates" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Templates
                </TabsTrigger>
              </TabsList>

              <TabsContent value="generate">
                <EmailGenerator templates={displayTemplates} isLoading={isLoading} />
              </TabsContent>

              <TabsContent value="respond">
                <EmailResponder />
              </TabsContent>

              <TabsContent value="translate">
                <EmailTranslator />
              </TabsContent>

              <TabsContent value="templates">
                <TemplateManager 
                  templates={displayTemplates} 
                  onTemplatesChange={refetch}
                  isLoading={isLoading}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;


import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, FileText } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { EmailTemplate, createEmailTemplate, updateEmailTemplate, deleteEmailTemplate } from '@/services/emailApi';

interface TemplateManagerProps {
  templates: EmailTemplate[];
  onTemplatesChange: () => void;
  isLoading?: boolean;
}

const TemplateManager = ({ templates, onTemplatesChange, isLoading }: TemplateManagerProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    content: '',
    purpose: '',
    language: 'en'
  });

  const extractPlaceholders = (text: string): string[] => {
    const matches = text.match(/\{([^}]+)\}/g);
    return matches ? matches.map(match => match.slice(1, -1)) : [];
  };

  const resetForm = () => {
    setFormData({ title: '', subject: '', content: '', purpose: '', language: 'en' });
    setEditingTemplate(null);
  };

  const openDialog = (template?: EmailTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        title: template.title,
        subject: template.subject,
        content: template.content,
        purpose: template.purpose,
        language: template.language
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const saveTemplate = async () => {
    if (!formData.title.trim() || !formData.subject.trim() || !formData.content.trim() || !formData.purpose.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      if (editingTemplate) {
        await updateEmailTemplate(editingTemplate.id, {
          title: formData.title.trim(),
          subject: formData.subject.trim(),
          content: formData.content.trim(),
          purpose: formData.purpose.trim(),
          language: formData.language,
        });
        
        toast({
          title: "Template Updated",
          description: "Your template has been updated successfully.",
        });
      } else {
        await createEmailTemplate({
          title: formData.title.trim(),
          subject: formData.subject.trim(),
          content: formData.content.trim(),
          purpose: formData.purpose.trim(),
          language: formData.language,
        });
        
        toast({
          title: "Template Created",
          description: "Your new template has been created successfully.",
        });
      }

      onTemplatesChange();
      closeDialog();
    } catch (error) {
      console.error('Failed to save template:', error);
      toast({
        title: "Error",
        description: "Failed to save template. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    try {
      await deleteEmailTemplate(id);
      onTemplatesChange();
      toast({
        title: "Template Deleted",
        description: "The template has been removed.",
      });
    } catch (error) {
      console.error('Failed to delete template:', error);
      toast({
        title: "Error",
        description: "Failed to delete template. Please try again.",
        variant: "destructive",
      });
    }
  };

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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Email Templates
              </CardTitle>
              <CardDescription>
                Manage your custom email templates with placeholders
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openDialog()} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingTemplate ? 'Edit Template' : 'Create New Template'}
                  </DialogTitle>
                  <DialogDescription>
                    Create reusable email templates with placeholders like {'{recipient_name}'} or {'{company_name}'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="template-title">Template Title *</Label>
                    <Input
                      id="template-title"
                      placeholder="e.g., Business Inquiry, Follow-up Email"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="template-purpose">Purpose *</Label>
                    <Input
                      id="template-purpose"
                      placeholder="e.g., business_inquiry, meeting_request"
                      value={formData.purpose}
                      onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="template-subject">Subject Line *</Label>
                    <Input
                      id="template-subject"
                      placeholder="e.g., Inquiry about {product/service}"
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="template-content">Email Content *</Label>
                    <Textarea
                      id="template-content"
                      placeholder="Enter your email template with placeholders like {recipient_name}, {company_name}, etc."
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      rows={10}
                    />
                  </div>
                  {(formData.subject || formData.content) && (
                    <div>
                      <Label>Detected Placeholders</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {[...new Set([
                          ...extractPlaceholders(formData.subject),
                          ...extractPlaceholders(formData.content)
                        ])].map((placeholder, index) => (
                          <Badge key={index} variant="secondary">
                            {placeholder}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={closeDialog} disabled={isSaving}>
                    Cancel
                  </Button>
                  <Button onClick={saveTemplate} disabled={isSaving}>
                    {isSaving ? 'Saving...' : editingTemplate ? 'Update Template' : 'Create Template'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No templates created yet.</p>
              <p className="text-sm">Create your first template to get started!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {templates.map((template) => {
                const placeholders = [
                  ...new Set([
                    ...extractPlaceholders(template.subject),
                    ...extractPlaceholders(template.content)
                  ])
                ];
                
                return (
                  <Card key={template.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">{template.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Subject: {template.subject}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Purpose: {template.purpose} | Language: {template.language}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDialog(template)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTemplate(template.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm text-gray-700 line-clamp-3">
                          {template.content.substring(0, 200)}
                          {template.content.length > 200 ? '...' : ''}
                        </p>
                      </div>
                      
                      {placeholders.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 mb-2">Placeholders:</p>
                          <div className="flex flex-wrap gap-1">
                            {placeholders.map((placeholder, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {placeholder}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplateManager;

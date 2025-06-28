import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, X, Loader2 } from 'lucide-react';
import { ExtractedEmailDetails } from '@/services/emailAssistantApi';


interface EmailDetailsConfirmationProps {
  details: ExtractedEmailDetails;
  onConfirm: (confirmedDetails: ExtractedEmailDetails) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'formal', label: 'Formal' },
  { value: 'casual', label: 'Casual' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'apologetic', label: 'Apologetic' },
  { value: 'persuasive', label: 'Persuasive' }
];

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' }
];

export function EmailDetailsConfirmation({ 
  details, 
  onConfirm, 
  onCancel, 
  isLoading = false 
}: EmailDetailsConfirmationProps) {
  const [formData, setFormData] = useState<ExtractedEmailDetails>({
    recipient: details.recipient || '',
    purpose: details.purpose || '',
    tone: details.tone || 'professional',
    language: details.language || 'en',
    context: details.context || '',
    additional_info: details.additional_info || ''
  });

  const handleInputChange = (field: keyof ExtractedEmailDetails, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConfirm = () => {
    onConfirm(formData);
  };

  const isFormValid = formData.recipient && formData.purpose && formData.context;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Confirm Email Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="recipient" className="text-xs font-medium">
            Recipient *
          </Label>
          <Input
            id="recipient"
            value={formData.recipient}
            onChange={(e) => handleInputChange('recipient', e.target.value)}
            placeholder="e.g., John Smith, john@company.com"
            className="text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="purpose" className="text-xs font-medium">
            Purpose *
          </Label>
          <Input
            id="purpose"
            value={formData.purpose}
            onChange={(e) => handleInputChange('purpose', e.target.value)}
            placeholder="e.g., Follow up on meeting, Request information"
            className="text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="context" className="text-xs font-medium">
            Context *
          </Label>
          <Textarea
            id="context"
            value={formData.context}
            onChange={(e) => handleInputChange('context', e.target.value)}
            placeholder="Provide context about the email..."
            className="text-sm min-h-[80px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="tone" className="text-xs font-medium">
              Tone
            </Label>
            <Select
              value={formData.tone}
              onValueChange={(value) => handleInputChange('tone', value)}
            >
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TONE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language" className="text-xs font-medium">
              Language
            </Label>
            <Select
              value={formData.language}
              onValueChange={(value) => handleInputChange('language', value)}
            >
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="additional_info" className="text-xs font-medium">
            Additional Information
          </Label>
          <Textarea
            id="additional_info"
            value={formData.additional_info}
            onChange={(e) => handleInputChange('additional_info', e.target.value)}
            placeholder="Any additional details or special requirements..."
            className="text-sm min-h-[60px]"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleConfirm}
            disabled={!isFormValid || isLoading}
            className="flex-1 text-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Email'
            )}
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            size="icon"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        {!isFormValid && (
          <p className="text-xs text-muted-foreground">
            * Required fields must be filled
          </p>
        )}
      </CardContent>
    </Card>
  );
}
import React, { useState, useEffect } from 'react';
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
    additional_info: details.additional_info || {}
  });

  // Helper to manage additional_info as text input
  const [additionalInfoText, setAdditionalInfoText] = useState<string>(() => {
    if (typeof details.additional_info === 'string') {
      return details.additional_info;
    } else if (typeof details.additional_info === 'object' && details.additional_info) {
      // If it's an object with a 'notes' field, extract just the notes
      if ('notes' in details.additional_info) {
        return String(details.additional_info.notes);
      }
      // Otherwise, show key-value pairs in a readable format
      return Object.entries(details.additional_info)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
    }
    return '';
  });

  // Update formData when additionalInfoText changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      additional_info: additionalInfoText ? { notes: additionalInfoText } : {}
    }));
  }, [additionalInfoText]);

  const handleInputChange = (field: keyof ExtractedEmailDetails, value: string) => {
    if (field === 'additional_info') {
      setAdditionalInfoText(value);
      // Convert text to object for the form data
      setFormData(prev => ({
        ...prev,
        additional_info: value ? { notes: value } : {}
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleConfirm = () => {
    // Ensure additional_info is properly formatted as object
    const confirmedData = {
      ...formData,
      additional_info: additionalInfoText ? { notes: additionalInfoText } : {}
    };
    onConfirm(confirmedData);
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

        <div className="space-y-3">
          <Label htmlFor="additional_info" className="text-xs font-medium">
            Additional Information
            <span className="text-muted-foreground font-normal ml-1">(Optional)</span>
          </Label>
          
          {/* Quick add buttons for common info */}
          <div className="flex flex-wrap gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs h-6 px-2"
              onClick={() => {
                const timeInfo = "Meeting time: ";
                if (!additionalInfoText.includes("Meeting time:")) {
                  setAdditionalInfoText(prev => prev ? `${prev}\n${timeInfo}` : timeInfo);
                }
              }}
            >
              + Time
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs h-6 px-2"
              onClick={() => {
                const locationInfo = "Location: ";
                if (!additionalInfoText.includes("Location:")) {
                  setAdditionalInfoText(prev => prev ? `${prev}\n${locationInfo}` : locationInfo);
                }
              }}
            >
              + Location
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs h-6 px-2"
              onClick={() => {
                const deadlineInfo = "Deadline: ";
                if (!additionalInfoText.includes("Deadline:")) {
                  setAdditionalInfoText(prev => prev ? `${prev}\n${deadlineInfo}` : deadlineInfo);
                }
              }}
            >
              + Deadline
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs h-6 px-2"
              onClick={() => {
                const contactInfo = "Contact preference: ";
                if (!additionalInfoText.includes("Contact preference:")) {
                  setAdditionalInfoText(prev => prev ? `${prev}\n${contactInfo}` : contactInfo);
                }
              }}
            >
              + Contact
            </Button>
          </div>
          
          <Textarea
            id="additional_info"
            value={additionalInfoText}
            onChange={(e) => handleInputChange('additional_info', e.target.value)}
            placeholder="Add any extra details, special requirements, or notes...

Examples:
• Meeting time: Monday at 9:00 AM
• Property details: 3 bedroom house  
• Contact preferences: Email preferred
• Deadlines or urgency
• Special instructions"
            className="text-sm min-h-[80px] placeholder:text-xs"
          />
          {additionalInfoText && (
            <div className="text-xs text-muted-foreground">
              💡 This information will be included in your email to provide more context
            </div>
          )}
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
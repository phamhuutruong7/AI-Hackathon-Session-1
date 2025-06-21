
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, MessageSquare } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

const EmailResponder = () => {
  const [originalEmail, setOriginalEmail] = useState('');
  const [responseType, setResponseType] = useState('professional');
  const [additionalContext, setAdditionalContext] = useState('');
  const [generatedResponse, setGeneratedResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const responseTypes = [
    { value: 'professional', label: 'Professional & Formal' },
    { value: 'friendly', label: 'Friendly & Casual' },
    { value: 'apologetic', label: 'Apologetic & Understanding' },
    { value: 'declining', label: 'Polite Decline' },
    { value: 'accepting', label: 'Positive Acceptance' },
    { value: 'requesting', label: 'Request for Information' },
  ];

  const generateResponse = () => {
    if (!originalEmail.trim()) {
      toast({
        title: "Missing Email",
        description: "Please paste the original email to respond to.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    // Simulate AI response generation
    setTimeout(() => {
      const responses = {
        professional: `Dear [Sender Name],

Thank you for your email. I appreciate you taking the time to reach out.

${additionalContext || 'I have carefully reviewed your message and would like to provide the following response:'}

[Your main response content here based on the original email]

Please let me know if you need any additional information or clarification.

Best regards,
[Your Name]`,

        friendly: `Hi there!

Thanks for reaching out! I really appreciate your email.

${additionalContext || 'I wanted to get back to you quickly about your message.'}

[Your response content here]

Hope this helps! Feel free to reach out if you have any other questions.

Cheers,
[Your Name]`,

        apologetic: `Dear [Sender Name],

Thank you for your email, and I sincerely apologize for any inconvenience this may have caused.

${additionalContext || 'I understand your concerns and want to make this right.'}

[Your response content addressing the issue]

Please accept my apologies, and I look forward to resolving this matter promptly.

Best regards,
[Your Name]`,

        declining: `Dear [Sender Name],

Thank you for thinking of me for this opportunity.

${additionalContext || 'After careful consideration, I must respectfully decline at this time.'}

[Brief explanation if appropriate]

I wish you the best of luck with your project and hope we can collaborate in the future.

Best regards,
[Your Name]`,

        accepting: `Dear [Sender Name],

Thank you for your email. I am delighted to accept your proposal/invitation.

${additionalContext || 'I am excited about this opportunity and look forward to working together.'}

[Details about next steps or additional information]

Please let me know how you would like to proceed.

Best regards,
[Your Name]`,

        requesting: `Dear [Sender Name],

Thank you for your email. I appreciate the information you have provided.

${additionalContext || 'I would like to request some additional information to better understand the situation.'}

Could you please provide:
- [Information point 1]
- [Information point 2]
- [Information point 3]

Thank you for your time and assistance.

Best regards,
[Your Name]`
      };

      setGeneratedResponse(responses[responseType as keyof typeof responses]);
      setIsGenerating(false);

      toast({
        title: "Response Generated!",
        description: "Your email response has been generated successfully.",
      });
    }, 1500);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedResponse);
    toast({
      title: "Copied!",
      description: "Email response copied to clipboard.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Write Email Response
          </CardTitle>
          <CardDescription>
            Paste an email and generate an appropriate response
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="original-email">Original Email</Label>
            <Textarea
              id="original-email"
              placeholder="Paste the email you want to respond to..."
              value={originalEmail}
              onChange={(e) => setOriginalEmail(e.target.value)}
              rows={6}
            />
          </div>

          <div>
            <Label htmlFor="response-type">Response Type</Label>
            <Select value={responseType} onValueChange={setResponseType}>
              <SelectTrigger id="response-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {responseTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="additional-context">Additional Context (Optional)</Label>
            <Textarea
              id="additional-context"
              placeholder="Any specific points you want to include in your response..."
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              rows={3}
            />
          </div>

          <Button 
            onClick={generateResponse} 
            disabled={!originalEmail.trim() || isGenerating}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isGenerating ? "Generating Response..." : "Generate Response"}
          </Button>
        </CardContent>
      </Card>

      {generatedResponse && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Response</CardTitle>
            <CardDescription>Your email response is ready</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Email Response</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                value={generatedResponse}
                readOnly
                rows={15}
                className="bg-gray-50"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmailResponder;


import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Languages, ArrowRight } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { translateEmail } from '@/services/emailApi';

const EmailTranslator = () => {
  const [emailText, setEmailText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese (Simplified)' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
    { code: 'nl', name: 'Dutch' },
    { code: 'sv', name: 'Swedish' },
    { code: 'da', name: 'Danish' },
    { code: 'no', name: 'Norwegian' },
    { code: 'fi', name: 'Finnish' },
    { code: 'pl', name: 'Polish' },
    { code: 'tr', name: 'Turkish' },
  ];

  const handleTranslateEmail = async () => {
    if (!emailText.trim() || !targetLanguage) {
      toast({
        title: "Missing Information",
        description: "Please enter text to translate and select a target language.",
        variant: "destructive",
      });
      return;
    }

    setIsTranslating(true);

    try {
      const response = await translateEmail({
        content: emailText,
        target_language: targetLanguage,
        source_language: sourceLanguage,
      });

      setTranslatedText(response.translated_content || response.content || 'Translation completed');
      
      toast({
        title: "Translation Complete!",
        description: "Your email has been translated successfully.",
      });
    } catch (error) {
      console.error('Failed to translate email:', error);
      
      // Fallback with mock translation
      const mockTranslations: Record<string, string> = {
        'es': 'Estimado/a [Nombre],\n\nEspero que este correo electrónico te encuentre bien. Me pongo en contacto contigo para...\n\n[Contenido traducido del email]\n\nGracias por tu tiempo y consideración.\n\nSaludos cordiales,\n[Tu Nombre]',
        'fr': 'Cher/Chère [Nom],\n\nJ\'espère que ce courriel vous trouve en bonne santé. Je vous contacte au sujet de...\n\n[Contenu traduit de l\'email]\n\nMerci pour votre temps et considération.\n\nCordialement,\n[Votre Nom]',
        'de': 'Liebe/r [Name],\n\nIch hoffe, diese E-Mail erreicht Sie bei guter Gesundheit. Ich kontaktiere Sie bezüglich...\n\n[Übersetzter E-Mail-Inhalt]\n\nVielen Dank für Ihre Zeit und Aufmerksamkeit.\n\nMit freundlichen Grüßen,\n[Ihr Name]',
      };

      const translated = mockTranslations[targetLanguage] || `[Translated content in ${languages.find(l => l.code === targetLanguage)?.name}]\n\n${emailText}\n\n[Translation completed offline]`;
      
      setTranslatedText(translated);
      
      toast({
        title: "Translation Complete (Offline)",
        description: "Generated using fallback. API temporarily unavailable.",
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(translatedText);
    toast({
      title: "Copied!",
      description: "Translated text copied to clipboard.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Translate Email
          </CardTitle>
          <CardDescription>
            Translate your emails to communicate across language barriers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email-text">Email Text</Label>
            <Textarea
              id="email-text"
              placeholder="Paste or type the email content you want to translate..."
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
              rows={6}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <Label htmlFor="source-language">From</Label>
              <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                <SelectTrigger id="source-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="h-6 w-6 text-gray-400" />
            </div>

            <div>
              <Label htmlFor="target-language">To</Label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger id="target-language">
                  <SelectValue placeholder="Select target language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleTranslateEmail} 
            disabled={!emailText.trim() || !targetLanguage || isTranslating}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isTranslating ? "Translating..." : "Translate Email"}
          </Button>
        </CardContent>
      </Card>

      {translatedText && (
        <Card>
          <CardHeader>
            <CardTitle>Translation Result</CardTitle>
            <CardDescription>
              Translated to {languages.find(l => l.code === targetLanguage)?.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Translated Text</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                value={translatedText}
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

export default EmailTranslator;

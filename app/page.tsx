'use client';

import { useState } from 'react';
import AuthForm from '@/components/auth/auth-form';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export default function Home() {
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Language Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
          className="flex items-center"
        >
          <Globe className="h-4 w-4 mr-2" />
          {language === 'en' ? 'हिंदी' : 'English'}
        </Button>
      </div>

      <AuthForm language={language} />
    </div>
  );
}
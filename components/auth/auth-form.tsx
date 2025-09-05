'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Leaf, Users } from 'lucide-react';
import { signIn, signUp } from '@/lib/auth';
import { useTranslation } from '@/lib/i18n';

interface AuthFormProps {
  language?: 'en' | 'hi';
}

export default function AuthForm({ language = 'en' }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { t } = useTranslation(language);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;
    const contact = formData.get('contact') as string;
    const role = formData.get('role') as 'farmer' | 'verifier';

    try {
      await signUp(email, password, {
        name,
        contact,
        language,
        role,
      });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Leaf className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            CarbonMRV+
          </CardTitle>
          <p className="text-gray-600">
            {language === 'hi' 
              ? 'कार्बन क्रेडिट के लिए MRV प्लेटफॉर्म' 
              : 'MRV Platform for Carbon Credits'}
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">
                {language === 'hi' ? 'साइन इन' : 'Sign In'}
              </TabsTrigger>
              <TabsTrigger value="signup">
                {language === 'hi' ? 'साइन अप' : 'Sign Up'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">
                    {language === 'hi' ? 'ईमेल' : 'Email'}
                  </Label>
                  <Input
                    id="signin-email"
                    name="email"
                    type="email"
                    required
                    placeholder={language === 'hi' ? 'आपका ईमेल' : 'Your email'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">
                    {language === 'hi' ? 'पासवर्ड' : 'Password'}
                  </Label>
                  <Input
                    id="signin-password"
                    name="password"
                    type="password"
                    required
                    placeholder={language === 'hi' ? 'आपका पासवर्ड' : 'Your password'}
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (language === 'hi' ? 'लोड हो रहा है...' : 'Loading...') : t('signOut')}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">
                    {language === 'hi' ? 'नाम' : 'Full Name'}
                  </Label>
                  <Input
                    id="signup-name"
                    name="name"
                    type="text"
                    required
                    placeholder={language === 'hi' ? 'आपका नाम' : 'Your full name'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">
                    {language === 'hi' ? 'ईमेल' : 'Email'}
                  </Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    required
                    placeholder={language === 'hi' ? 'आपका ईमेल' : 'Your email'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-contact">
                    {language === 'hi' ? 'संपर्क नंबर' : 'Contact Number'}
                  </Label>
                  <Input
                    id="signup-contact"
                    name="contact"
                    type="tel"
                    placeholder={language === 'hi' ? 'फोन नंबर' : 'Phone number'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-role">
                    {language === 'hi' ? 'भूमिका' : 'Role'}
                  </Label>
                  <Select name="role" defaultValue="farmer">
                    <SelectTrigger>
                      <SelectValue placeholder={language === 'hi' ? 'भूमिका चुनें' : 'Select role'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="farmer">
                        <div className="flex items-center">
                          <Leaf className="h-4 w-4 mr-2" />
                          {language === 'hi' ? 'किसान' : 'Farmer'}
                        </div>
                      </SelectItem>
                      <SelectItem value="verifier">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          {language === 'hi' ? 'सत्यापनकर्ता' : 'Verifier'}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">
                    {language === 'hi' ? 'पासवर्ड' : 'Password'}
                  </Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    required
                    placeholder={language === 'hi' ? 'पासवर्ड बनाएं' : 'Create password'}
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (language === 'hi' ? 'बना रहे हैं...' : 'Creating...') : (language === 'hi' ? 'अकाउंट बनाएं' : 'Create Account')}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
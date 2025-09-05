'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/navbar';
import DashboardStats from '@/components/farmer/dashboard-stats';
import FarmList from '@/components/farmer/farm-list';
import FarmForm from '@/components/farmer/farm-form';
import { getCurrentUser } from '@/lib/auth';
import { supabase, Farm } from '@/lib/supabase';
import { Language } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, TrendingUp, BarChart3 } from 'lucide-react';

interface DashboardStats {
  totalFarms: number;
  totalCredits: number;
  pendingSubmissions: number;
  verifiedSubmissions: number;
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [farms, setFarms] = useState<Farm[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalFarms: 0,
    totalCredits: 0,
    pendingSubmissions: 0,
    verifiedSubmissions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showFarmForm, setShowFarmForm] = useState(false);
  const [editingFarm, setEditingFarm] = useState<Farm | undefined>();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push('/');
        return;
      }
      setUser(currentUser);
      setLanguage((currentUser.farmer?.language as Language) || 'en');
      await loadDashboardData(currentUser.farmer?.id!);
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDashboardData = async (farmerId: string) => {
    try {
      // Load farms
      const { data: farmsData } = await supabase
        .from('farms')
        .select('*')
        .eq('farmer_id', farmerId)
        .order('created_at', { ascending: false });

      if (farmsData) {
        setFarms(farmsData);

        // Load submissions and carbon estimates
        const farmIds = farmsData.map(f => f.id);
        if (farmIds.length > 0) {
          const { data: submissionsData } = await supabase
            .from('submissions')
            .select(`
              *,
              carbon_estimates (*)
            `)
            .in('farm_id', farmIds);

          if (submissionsData) {
            const totalCredits = submissionsData.reduce((sum, sub: any) => {
              const estimate = sub.carbon_estimates?.[0];
              return sum + (estimate?.carbon_credits || 0);
            }, 0);

            setStats({
              totalFarms: farmsData.length,
              totalCredits,
              pendingSubmissions: submissionsData.filter((s: any) => s.status === 'pending').length,
              verifiedSubmissions: submissionsData.filter((s: any) => s.status === 'verified').length,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleAddFarm = () => {
    setEditingFarm(undefined);
    setShowFarmForm(true);
  };

  const handleEditFarm = (farm: Farm) => {
    setEditingFarm(farm);
    setShowFarmForm(true);
  };

  const handleDeleteFarm = async (farmId: string) => {
    if (confirm(language === 'hi' ? 'क्या आप इस खेत को हटाना चाहते हैं?' : 'Are you sure you want to delete this farm?')) {
      try {
        await supabase.from('farms').delete().eq('id', farmId);
        await loadDashboardData(user.farmer.id);
      } catch (error) {
        console.error('Error deleting farm:', error);
      }
    }
  };

  const handleFarmSuccess = async (farm: Farm) => {
    setShowFarmForm(false);
    setEditingFarm(undefined);
    await loadDashboardData(user.farmer.id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // If user is a verifier, redirect to verifier dashboard
  if (user.farmer?.role === 'verifier') {
    router.push('/verifier');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        user={{
          name: user.farmer?.name || user.email,
          email: user.email,
          role: user.farmer?.role || 'farmer',
        }}
        language={language}
        onLanguageChange={setLanguage}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {language === 'hi' ? 'स्वागत वापसी' : 'Welcome back'}, {user.farmer?.name}!
          </h1>
          <p className="text-gray-600 mt-1">
            {language === 'hi' 
              ? 'आपके कार्बन क्रेडिट और फार्म डेटा का अवलोकन'
              : 'Overview of your carbon credits and farm data'
            }
          </p>
        </div>

        {/* Dashboard Stats */}
        <div className="mb-8">
          <DashboardStats stats={stats} language={language} />
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Carbon Credits Trend */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                {language === 'hi' ? 'कार्बन क्रेडिट ट्रेंड' : 'Carbon Credits Trend'}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-48 text-gray-500">
              {language === 'hi' 
                ? 'चार्ट डेटा उपलब्ध होने पर यहाँ दिखाया जाएगा'
                : 'Chart will be displayed here when data is available'
              }
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'hi' ? 'त्वरित कार्य' : 'Quick Actions'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={handleAddFarm} 
                className="w-full justify-start"
                variant="outline"
              >
                {language === 'hi' ? 'नया खेत जोड़ें' : 'Add New Farm'}
              </Button>
              <Button 
                onClick={() => router.push('/submissions')} 
                className="w-full justify-start"
                variant="outline"
              >
                {language === 'hi' ? 'डेटा सबमिट करें' : 'Submit Data'}
              </Button>
              <Button 
                onClick={() => router.push('/reports')} 
                className="w-full justify-start"
                variant="outline"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                {language === 'hi' ? 'रिपोर्ट देखें' : 'View Reports'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Farm List */}
        <FarmList
          farms={farms}
          language={language}
          onEditFarm={handleEditFarm}
          onDeleteFarm={handleDeleteFarm}
          onAddFarm={handleAddFarm}
        />

        {/* Farm Form Dialog */}
        <Dialog open={showFarmForm} onOpenChange={setShowFarmForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingFarm 
                  ? (language === 'hi' ? 'खेत संपादित करें' : 'Edit Farm')
                  : (language === 'hi' ? 'नया खेत जोड़ें' : 'Add New Farm')
                }
              </DialogTitle>
            </DialogHeader>
            <FarmForm
              farmerId={user.farmer.id}
              existingFarm={editingFarm}
              language={language}
              onSuccess={handleFarmSuccess}
              onCancel={() => {
                setShowFarmForm(false);
                setEditingFarm(undefined);
              }}
            />
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
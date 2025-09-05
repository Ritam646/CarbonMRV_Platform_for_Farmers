'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/navbar';
import SubmissionMap from '@/components/verifier/submission-map';
import SubmissionTable from '@/components/verifier/submission-table';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { ReportGenerator } from '@/lib/report-generator';
import { Language } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Map, Table, Download, FileText } from 'lucide-react';

interface SubmissionData {
  id: string;
  farmName: string;
  farmerName: string;
  cropType: string;
  landSize: number;
  carbonCredits: number;
  confidenceScore: number;
  status: 'pending' | 'verified' | 'rejected';
  submissionDate: string;
  location?: { lat: number; lng: number };
}

export default function VerifierDashboard() {
  const [user, setUser] = useState<any>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser || currentUser.farmer?.role !== 'verifier') {
        router.push('/');
        return;
      }
      setUser(currentUser);
      setLanguage((currentUser.farmer?.language as Language) || 'en');
      await loadSubmissions();
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSubmissions = async () => {
    try {
      const { data } = await supabase
        .from('submissions')
        .select(`
          *,
          farms (
            *,
            farmers (name, contact)
          ),
          carbon_estimates (*)
        `)
        .order('created_at', { ascending: false });

      if (data) {
        const formattedSubmissions: SubmissionData[] = data.map((submission: any) => ({
          id: submission.id,
          farmName: submission.farms?.name || 'Unknown Farm',
          farmerName: submission.farms?.farmers?.name || 'Unknown Farmer',
          cropType: submission.farms?.crop_type || 'Unknown',
          landSize: submission.farms?.land_size || 0,
          carbonCredits: submission.carbon_estimates?.[0]?.carbon_credits || 0,
          confidenceScore: submission.carbon_estimates?.[0]?.confidence_score || 0,
          status: submission.status,
          submissionDate: submission.created_at,
          location: submission.farms?.gps_location ? {
            lat: submission.farms.gps_location.y,
            lng: submission.farms.gps_location.x,
          } : undefined,
        }));

        setSubmissions(formattedSubmissions);
      }
    } catch (error) {
      console.error('Error loading submissions:', error);
    }
  };

  const handleViewSubmission = (submissionId: string) => {
    // Navigate to detailed submission view
    router.push(`/verifier/submissions/${submissionId}`);
  };

  const handleVerifySubmission = async (submissionId: string, status: 'verified' | 'rejected') => {
    try {
      await supabase
        .from('submissions')
        .update({ status })
        .eq('id', submissionId);

      await loadSubmissions();
    } catch (error) {
      console.error('Error updating submission:', error);
    }
  };

  const handleGenerateReport = async (submissionIds: string[]) => {
    setIsGeneratingReport(true);
    
    try {
      // Fetch detailed data for selected submissions
      const { data } = await supabase
        .from('submissions')
        .select(`
          *,
          farms (*,
            farmers (*)
          ),
          carbon_estimates (*)
        `)
        .in('id', submissionIds);

      if (data) {
        const reportData = data.map((item: any) => ({
          farmer: item.farms.farmers,
          farm: item.farms,
          submission: item,
          estimate: item.carbon_estimates[0] || {},
        }));

        // Generate PDF report
        const pdfBlob = await ReportGenerator.generatePDF(reportData);
        const pdfUrl = await ReportGenerator.uploadReport(pdfBlob, `carbon-report-${Date.now()}.pdf`);

        // Download the report
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `CarbonMRV_Report_${new Date().toISOString().split('T')[0]}.pdf`;
        link.click();

        // Store report record
        await supabase.from('reports').insert({
          estimate_id: data[0].carbon_estimates[0]?.id,
          report_type: 'pdf',
          report_url: pdfUrl,
          generated_by: user.farmer.id,
        });
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleGenerateCSV = async () => {
    try {
      const { data } = await supabase
        .from('submissions')
        .select(`
          *,
          farms (*,
            farmers (*)
          ),
          carbon_estimates (*)
        `)
        .eq('status', 'verified');

      if (data) {
        const reportData = data.map((item: any) => ({
          farmer: item.farms.farmers,
          farm: item.farms,
          submission: item,
          estimate: item.carbon_estimates[0] || {},
        }));

        const csvBlob = ReportGenerator.generateCSV(reportData);
        const csvUrl = URL.createObjectURL(csvBlob);

        const link = document.createElement('a');
        link.href = csvUrl;
        link.download = `CarbonMRV_Data_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
      }
    } catch (error) {
      console.error('Error generating CSV:', error);
    }
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

  const stats = {
    totalSubmissions: submissions.length,
    pendingSubmissions: submissions.filter(s => s.status === 'pending').length,
    verifiedSubmissions: submissions.filter(s => s.status === 'verified').length,
    totalCredits: submissions.filter(s => s.status === 'verified').reduce((sum, s) => sum + s.carbonCredits, 0),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        user={{
          name: user.farmer?.name || user.email,
          email: user.email,
          role: user.farmer?.role || 'verifier',
        }}
        language={language}
        onLanguageChange={setLanguage}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {language === 'hi' ? 'सत्यापनकर्ता डैशबोर्ड' : 'Verifier Dashboard'}
            </h1>
            <p className="text-gray-600 mt-1">
              {language === 'hi' 
                ? 'किसान सबमिशन और कार्बन अनुमानों की समीक्षा करें'
                : 'Review farmer submissions and carbon estimates'
              }
            </p>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={handleGenerateCSV}
              variant="outline"
              className="flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              {language === 'hi' ? 'CSV एक्सपोर्ट' : 'Export CSV'}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {language === 'hi' ? 'कुल सबमिशन' : 'Total Submissions'}
              </CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalSubmissions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {language === 'hi' ? 'लंबित' : 'Pending'}
              </CardTitle>
              <div className="p-2 rounded-full bg-orange-50">
                <div className="h-4 w-4 bg-orange-600 rounded-full" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pendingSubmissions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {language === 'hi' ? 'सत्यापित' : 'Verified'}
              </CardTitle>
              <div className="p-2 rounded-full bg-green-50">
                <div className="h-4 w-4 bg-green-600 rounded-full" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.verifiedSubmissions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {language === 'hi' ? 'कुल क्रेडिट' : 'Total Credits'}
              </CardTitle>
              <div className="p-2 rounded-full bg-purple-50">
                <div className="h-4 w-4 bg-purple-600 rounded-full" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats.totalCredits.toFixed(2)} t CO₂e
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submissions View */}
        <Tabs defaultValue="table" className="space-y-6">
          <TabsList>
            <TabsTrigger value="table" className="flex items-center">
              <Table className="h-4 w-4 mr-2" />
              {language === 'hi' ? 'तालिका दृश्य' : 'Table View'}
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center">
              <Map className="h-4 w-4 mr-2" />
              {language === 'hi' ? 'नक्शा दृश्य' : 'Map View'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="table">
            <SubmissionTable
              submissions={submissions}
              language={language}
              onViewSubmission={handleViewSubmission}
              onVerifySubmission={handleVerifySubmission}
              onGenerateReport={handleGenerateReport}
            />
          </TabsContent>

          <TabsContent value="map">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'hi' ? 'भौगोलिक वितरण' : 'Geographic Distribution'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SubmissionMap
                  submissions={submissions.filter(s => s.location)}
                  onSubmissionSelect={handleViewSubmission}
                  language={language}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
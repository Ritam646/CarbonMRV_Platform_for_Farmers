'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Filter, Eye, FileText, CheckCircle, XCircle } from 'lucide-react';
import { useTranslation, Language } from '@/lib/i18n';
import { formatDistanceToNow } from 'date-fns';

interface SubmissionTableData {
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

interface SubmissionTableProps {
  submissions: SubmissionTableData[];
  language?: Language;
  onViewSubmission: (submissionId: string) => void;
  onVerifySubmission: (submissionId: string, status: 'verified' | 'rejected') => void;
  onGenerateReport: (submissionIds: string[]) => void;
}

export default function SubmissionTable({ 
  submissions, 
  language = 'en', 
  onViewSubmission, 
  onVerifySubmission,
  onGenerateReport 
}: SubmissionTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSubmissions, setSelectedSubmissions] = useState<Set<string>>(new Set());
  const { t } = useTranslation(language);

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = 
      submission.farmName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.cropType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSubmissions(new Set(filteredSubmissions.map(s => s.id)));
    } else {
      setSelectedSubmissions(new Set());
    }
  };

  const handleSelectSubmission = (submissionId: string, checked: boolean) => {
    const newSelected = new Set(selectedSubmissions);
    if (checked) {
      newSelected.add(submissionId);
    } else {
      newSelected.delete(submissionId);
    }
    setSelectedSubmissions(newSelected);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      pending: 'secondary',
      verified: 'default',
      rejected: 'destructive',
    };

    const labels = {
      pending: language === 'hi' ? 'लंबित' : 'Pending',
      verified: language === 'hi' ? 'सत्यापित' : 'Verified',
      rejected: language === 'hi' ? 'अस्वीकृत' : 'Rejected',
    };

    return (
      <Badge variant={variants[status] || 'default'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getCropTypeLabel = (cropType: string) => {
    const cropMap: Record<string, { en: string; hi: string }> = {
      rice: { en: 'Rice', hi: 'धान' },
      agroforestry: { en: 'Agroforestry', hi: 'कृषि वानिकी' },
      mixed_crops: { en: 'Mixed Crops', hi: 'मिश्रित फसल' },
      vegetables: { en: 'Vegetables', hi: 'सब्जियाँ' },
    };
    return cropMap[cropType]?.[language] || cropType;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t('farmerSubmissions')}</span>
          <div className="flex space-x-2">
            {selectedSubmissions.size > 0 && (
              <Button
                onClick={() => onGenerateReport(Array.from(selectedSubmissions))}
                className="flex items-center"
              >
                <FileText className="h-4 w-4 mr-2" />
                {t('generateReport')} ({selectedSubmissions.size})
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder={language === 'hi' ? 'किसान या खेत का नाम खोजें...' : 'Search farmer or farm name...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder={language === 'hi' ? 'स्थिति फ़िल्टर' : 'Filter by status'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {language === 'hi' ? 'सभी स्थितियां' : 'All Status'}
              </SelectItem>
              <SelectItem value="pending">
                {language === 'hi' ? 'लंबित' : 'Pending'}
              </SelectItem>
              <SelectItem value="verified">
                {language === 'hi' ? 'सत्यापित' : 'Verified'}
              </SelectItem>
              <SelectItem value="rejected">
                {language === 'hi' ? 'अस्वीकृत' : 'Rejected'}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedSubmissions.size === filteredSubmissions.length && filteredSubmissions.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded"
                  />
                </TableHead>
                <TableHead>{language === 'hi' ? 'किसान' : 'Farmer'}</TableHead>
                <TableHead>{language === 'hi' ? 'खेत' : 'Farm'}</TableHead>
                <TableHead>{language === 'hi' ? 'फसल' : 'Crop'}</TableHead>
                <TableHead>{language === 'hi' ? 'आकार' : 'Size'}</TableHead>
                <TableHead>{language === 'hi' ? 'कार्बन क्रेडिट' : 'Carbon Credits'}</TableHead>
                <TableHead>{language === 'hi' ? 'विश्वास' : 'Confidence'}</TableHead>
                <TableHead>{language === 'hi' ? 'स्थिति' : 'Status'}</TableHead>
                <TableHead>{language === 'hi' ? 'दिनांक' : 'Date'}</TableHead>
                <TableHead className="text-right">{language === 'hi' ? 'कार्य' : 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                    {language === 'hi' ? 'कोई सबमिशन नहीं मिला' : 'No submissions found'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedSubmissions.has(submission.id)}
                        onChange={(e) => handleSelectSubmission(submission.id, e.target.checked)}
                        className="rounded"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{submission.farmerName}</TableCell>
                    <TableCell>{submission.farmName}</TableCell>
                    <TableCell>{getCropTypeLabel(submission.cropType)}</TableCell>
                    <TableCell>{submission.landSize} ha</TableCell>
                    <TableCell>{submission.carbonCredits.toFixed(2)} t CO₂e</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${submission.confidenceScore * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">
                          {(submission.confidenceScore * 100).toFixed(0)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(submission.status)}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDistanceToNow(new Date(submission.submissionDate), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onViewSubmission(submission.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {submission.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onVerifySubmission(submission.id, 'verified')}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onVerifySubmission(submission.id, 'rejected')}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        {filteredSubmissions.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {filteredSubmissions.length}
                </div>
                <div className="text-sm text-gray-600">
                  {language === 'hi' ? 'कुल सबमिशन' : 'Total Submissions'}
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {filteredSubmissions.filter(s => s.status === 'verified').length}
                </div>
                <div className="text-sm text-gray-600">
                  {language === 'hi' ? 'सत्यापित' : 'Verified'}
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {filteredSubmissions.filter(s => s.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">
                  {language === 'hi' ? 'लंबित' : 'Pending'}
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {filteredSubmissions.reduce((sum, s) => sum + s.carbonCredits, 0).toFixed(2)} t CO₂e
                </div>
                <div className="text-sm text-gray-600">
                  {language === 'hi' ? 'कुल क्रेडिट' : 'Total Credits'}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
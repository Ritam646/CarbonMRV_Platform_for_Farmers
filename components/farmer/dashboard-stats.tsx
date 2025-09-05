'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Award, Clock, Leaf } from 'lucide-react';
import { useTranslation, Language } from '@/lib/i18n';

interface DashboardStatsProps {
  stats: {
    totalFarms: number;
    totalCredits: number;
    pendingSubmissions: number;
    verifiedSubmissions: number;
  };
  language?: Language;
}

export default function DashboardStats({ stats, language = 'en' }: DashboardStatsProps) {
  const { t } = useTranslation(language);

  const statCards = [
    {
      title: t('totalFarms'),
      value: stats.totalFarms,
      icon: MapPin,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: t('totalCredits'),
      value: `${stats.totalCredits.toFixed(2)} t CO₂e`,
      icon: Award,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: t('pendingSubmissions'),
      value: stats.pendingSubmissions,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: language === 'hi' ? 'सत्यापित प्रस्तुतियाँ' : 'Verified Submissions',
      value: stats.verifiedSubmissions,
      icon: Leaf,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {language === 'hi' 
                ? (index === 1 ? 'कुल अनुमानित क्रेडिट' : 'कुल गिनती')
                : (index === 1 ? 'Total estimated credits' : 'Total count')
              }
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
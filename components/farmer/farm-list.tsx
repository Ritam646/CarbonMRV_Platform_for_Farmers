'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Edit, Trash2, Plus } from 'lucide-react';
import { Farm } from '@/lib/supabase';
import { useTranslation, Language } from '@/lib/i18n';
import { formatDistanceToNow } from 'date-fns';

interface FarmListProps {
  farms: Farm[];
  language?: Language;
  onEditFarm: (farm: Farm) => void;
  onDeleteFarm: (farmId: string) => void;
  onAddFarm: () => void;
}

export default function FarmList({ 
  farms, 
  language = 'en', 
  onEditFarm, 
  onDeleteFarm, 
  onAddFarm 
}: FarmListProps) {
  const { t } = useTranslation(language);

  const getCropTypeLabel = (cropType: string) => {
    const cropMap: Record<string, { en: string; hi: string }> = {
      rice: { en: 'Rice', hi: 'धान' },
      agroforestry: { en: 'Agroforestry', hi: 'कृषि वानिकी' },
      mixed_crops: { en: 'Mixed Crops', hi: 'मिश्रित फसल' },
      vegetables: { en: 'Vegetables', hi: 'सब्जियाँ' },
    };
    return cropMap[cropType]?.[language] || cropType;
  };

  if (farms.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {language === 'hi' ? 'कोई खेत नहीं मिला' : 'No farms found'}
          </h3>
          <p className="text-gray-600 mb-6">
            {language === 'hi' 
              ? 'कार्बन क्रेडिट ट्रैकिंग शुरू करने के लिए अपना पहला खेत जोड़ें।'
              : 'Add your first farm to start tracking carbon credits.'
            }
          </p>
          <Button onClick={onAddFarm} className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            {t('addNewFarm')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          {t('farms')} ({farms.length})
        </h2>
        <Button onClick={onAddFarm} className="flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          {t('addNewFarm')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {farms.map((farm) => (
          <Card key={farm.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-start justify-between">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-green-600 mr-2" />
                  <span className="truncate">{farm.name}</span>
                </div>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEditFarm(farm)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeleteFarm(farm.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="secondary">
                  {getCropTypeLabel(farm.crop_type)}
                </Badge>
                <span className="text-sm text-gray-600">
                  {farm.land_size} {language === 'hi' ? 'हेक्टेयर' : 'ha'}
                </span>
              </div>

              {farm.gps_location && (
                <div className="text-sm text-gray-600">
                  <MapPin className="h-3 w-3 inline mr-1" />
                  {farm.gps_location.y.toFixed(4)}, {farm.gps_location.x.toFixed(4)}
                </div>
              )}

              {farm.practices.water_management && (
                <div className="text-sm">
                  <span className="font-medium">
                    {language === 'hi' ? 'जल प्रबंधन:' : 'Water Management:'}
                  </span>
                  <span className="ml-1 text-gray-600">
                    {farm.practices.water_management.replace('_', ' ')}
                  </span>
                </div>
              )}

              {farm.images && farm.images.length > 0 && (
                <div className="flex space-x-1">
                  {farm.images.slice(0, 3).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${farm.name} image ${index + 1}`}
                      className="w-12 h-12 object-cover rounded border"
                    />
                  ))}
                  {farm.images.length > 3 && (
                    <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-600">
                      +{farm.images.length - 3}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center text-xs text-gray-500 pt-2 border-t">
                <Calendar className="h-3 w-3 mr-1" />
                {language === 'hi' ? 'जोड़ा गया ' : 'Added '}
                {formatDistanceToNow(new Date(farm.created_at), { addSuffix: true })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
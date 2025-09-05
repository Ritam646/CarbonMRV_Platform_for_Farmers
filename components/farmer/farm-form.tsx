'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, Camera, Loader2, CheckCircle } from 'lucide-react';
import { supabase, Farm } from '@/lib/supabase';
import { useTranslation, Language } from '@/lib/i18n';

const farmSchema = z.object({
  name: z.string().min(2, 'Farm name must be at least 2 characters'),
  crop_type: z.string().min(1, 'Please select a crop type'),
  land_size: z.number().min(0.1, 'Land size must be greater than 0'),
  water_management: z.string().optional(),
  fertilizer_usage: z.string().optional(),
  agroforestry_methods: z.array(z.string()).optional(),
  gps_latitude: z.number().optional(),
  gps_longitude: z.number().optional(),
});

type FarmFormData = z.infer<typeof farmSchema>;

interface FarmFormProps {
  farmerId: string;
  existingFarm?: Farm;
  language?: Language;
  onSuccess?: (farm: Farm) => void;
  onCancel?: () => void;
}

const cropTypes = [
  { value: 'rice', labelEn: 'Rice', labelHi: 'धान' },
  { value: 'agroforestry', labelEn: 'Agroforestry', labelHi: 'कृषि वानिकी' },
  { value: 'mixed_crops', labelEn: 'Mixed Crops', labelHi: 'मिश्रित फसल' },
  { value: 'vegetables', labelEn: 'Vegetables', labelHi: 'सब्जियाँ' },
];

const waterManagementOptions = [
  { value: 'continuous_flooding', labelEn: 'Continuous Flooding', labelHi: 'निरंतर बाढ़' },
  { value: 'alternate_wetting_drying', labelEn: 'Alternate Wetting & Drying', labelHi: 'वैकल्पिक गीला और सूखा' },
  { value: 'rainfed', labelEn: 'Rainfed', labelHi: 'वर्षा आधारित' },
];

const agroforestryMethods = [
  { value: 'tree_plantation', labelEn: 'Tree Plantation', labelHi: 'वृक्षारोपण' },
  { value: 'silviculture', labelEn: 'Silviculture', labelHi: 'वन संवर्धन' },
  { value: 'intercropping', labelEn: 'Intercropping', labelHi: 'अंतर फसल' },
  { value: 'boundary_planting', labelEn: 'Boundary Planting', labelHi: 'सीमा रोपण' },
];

export default function FarmForm({ 
  farmerId, 
  existingFarm, 
  language = 'en', 
  onSuccess, 
  onCancel 
}: FarmFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [selectedAgroforestryMethods, setSelectedAgroforestryMethods] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const { t } = useTranslation(language);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FarmFormData>({
    resolver: zodResolver(farmSchema),
    defaultValues: existingFarm ? {
      name: existingFarm.name,
      crop_type: existingFarm.crop_type,
      land_size: existingFarm.land_size,
      water_management: existingFarm.practices.water_management || '',
      fertilizer_usage: existingFarm.practices.fertilizer_usage || '',
      agroforestry_methods: existingFarm.practices.agroforestry_methods || [],
      gps_latitude: existingFarm.gps_location?.y || undefined,
      gps_longitude: existingFarm.gps_location?.x || undefined,
    } : {},
  });

  const watchedCropType = watch('crop_type');

  useEffect(() => {
    if (existingFarm) {
      setSelectedAgroforestryMethods(existingFarm.practices.agroforestry_methods || []);
      setImages(existingFarm.images || []);
    }
  }, [existingFarm]);

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue('gps_latitude', position.coords.latitude);
          setValue('gps_longitude', position.coords.longitude);
          setIsGettingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsGettingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      setIsGettingLocation(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    // In a real implementation, upload to Supabase storage
    // For now, we'll create object URLs
    const newImages = files.map(file => URL.createObjectURL(file));
    setImages(prev => [...prev, ...newImages]);
  };

  const onSubmit = async (data: FarmFormData) => {
    setIsLoading(true);
    
    try {
      const farmData = {
        farmer_id: farmerId,
        name: data.name,
        crop_type: data.crop_type,
        land_size: data.land_size,
        gps_location: data.gps_latitude && data.gps_longitude 
          ? { x: data.gps_longitude, y: data.gps_latitude }
          : null,
        practices: {
          water_management: data.water_management,
          fertilizer_usage: data.fertilizer_usage,
          agroforestry_methods: selectedAgroforestryMethods,
        },
        images,
      };

      if (existingFarm) {
        const { data: updatedFarm, error } = await supabase
          .from('farms')
          .update(farmData)
          .eq('id', existingFarm.id)
          .select()
          .single();

        if (error) throw error;
        onSuccess?.(updatedFarm);
      } else {
        const { data: newFarm, error } = await supabase
          .from('farms')
          .insert([farmData])
          .select()
          .single();

        if (error) throw error;
        onSuccess?.(newFarm);
      }
    } catch (error) {
      console.error('Error saving farm:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAgroforestryMethod = (method: string) => {
    setSelectedAgroforestryMethods(prev => 
      prev.includes(method) 
        ? prev.filter(m => m !== method)
        : [...prev, method]
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-green-600" />
          {t('farmDetails')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Farm Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('farmName')}</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder={language === 'hi' ? 'खेत का नाम दर्ज करें' : 'Enter farm name'}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="crop_type">{t('cropType')}</Label>
              <Select
                onValueChange={(value) => setValue('crop_type', value)}
                defaultValue={existingFarm?.crop_type}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('cropType')} />
                </SelectTrigger>
                <SelectContent>
                  {cropTypes.map((crop) => (
                    <SelectItem key={crop.value} value={crop.value}>
                      {language === 'hi' ? crop.labelHi : crop.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.crop_type && (
                <p className="text-sm text-red-600">{errors.crop_type.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="land_size">{t('landSize')}</Label>
            <Input
              id="land_size"
              type="number"
              step="0.01"
              {...register('land_size', { valueAsNumber: true })}
              placeholder={language === 'hi' ? 'हेक्टेयर में आकार' : 'Size in hectares'}
            />
            {errors.land_size && (
              <p className="text-sm text-red-600">{errors.land_size.message}</p>
            )}
          </div>

          {/* GPS Location */}
          <div className="space-y-2">
            <Label>{t('gpsLocation')}</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Input
                type="number"
                step="any"
                {...register('gps_latitude', { valueAsNumber: true })}
                placeholder={language === 'hi' ? 'अक्षांश' : 'Latitude'}
              />
              <Input
                type="number"
                step="any"
                {...register('gps_longitude', { valueAsNumber: true })}
                placeholder={language === 'hi' ? 'देशांतर' : 'Longitude'}
              />
              <Button
                type="button"
                variant="outline"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="flex items-center"
              >
                {isGettingLocation ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <MapPin className="h-4 w-4 mr-2" />
                )}
                {isGettingLocation
                  ? (language === 'hi' ? 'स्थान प्राप्त कर रहे हैं...' : 'Getting location...')
                  : t('getCurrentLocation')
                }
              </Button>
            </div>
          </div>

          {/* Farming Practices */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('farmingPractices')}</h3>
            
            {/* Water Management - Show for rice */}
            {watchedCropType === 'rice' && (
              <div className="space-y-2">
                <Label htmlFor="water_management">{t('waterManagement')}</Label>
                <Select
                  onValueChange={(value) => setValue('water_management', value)}
                  defaultValue={existingFarm?.practices.water_management}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('waterManagement')} />
                  </SelectTrigger>
                  <SelectContent>
                    {waterManagementOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {language === 'hi' ? option.labelHi : option.labelEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Fertilizer Usage */}
            <div className="space-y-2">
              <Label htmlFor="fertilizer_usage">{t('fertilizerUsage')}</Label>
              <Textarea
                id="fertilizer_usage"
                {...register('fertilizer_usage')}
                placeholder={language === 'hi' ? 'उर्वरक के प्रकार और मात्रा का वर्णन करें' : 'Describe types and amounts of fertilizer used'}
                rows={3}
              />
            </div>

            {/* Agroforestry Methods - Show for agroforestry */}
            {watchedCropType === 'agroforestry' && (
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'कृषि वानिकी विधियां' : 'Agroforestry Methods'}</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {agroforestryMethods.map((method) => (
                    <div key={method.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={method.value}
                        checked={selectedAgroforestryMethods.includes(method.value)}
                        onCheckedChange={() => toggleAgroforestryMethod(method.value)}
                      />
                      <Label htmlFor={method.value} className="text-sm">
                        {language === 'hi' ? method.labelHi : method.labelEn}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="images">{t('uploadImages')}</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('images')?.click()}
                className="flex items-center"
              >
                <Camera className="h-4 w-4 mr-2" />
                {language === 'hi' ? 'तस्वीरें चुनें' : 'Select Images'}
              </Button>
              {images.length > 0 && (
                <span className="text-sm text-gray-600">
                  {images.length} {language === 'hi' ? 'तस्वीरें चुनी गईं' : 'images selected'}
                </span>
              )}
            </div>
            
            {/* Image Preview */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {images.slice(0, 3).map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Farm image ${index + 1}`}
                    className="w-full h-20 object-cover rounded-md border"
                  />
                ))}
                {images.length > 3 && (
                  <div className="w-full h-20 bg-gray-100 rounded-md border flex items-center justify-center text-sm text-gray-600">
                    +{images.length - 3} {language === 'hi' ? 'और' : 'more'}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              {isLoading 
                ? (language === 'hi' ? 'सहेज रहे हैं...' : 'Saving...') 
                : t('save')
              }
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                {t('cancel')}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
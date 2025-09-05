'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface SubmissionMapData {
  id: string;
  farmName: string;
  farmerName: string;
  cropType: string;
  landSize: number;
  carbonCredits: number;
  status: 'pending' | 'verified' | 'rejected';
  location: { lat: number; lng: number };
}

interface SubmissionMapProps {
  submissions: SubmissionMapData[];
  onSubmissionSelect: (submissionId: string) => void;
  language?: 'en' | 'hi';
}

export default function SubmissionMap({ 
  submissions, 
  onSubmissionSelect, 
  language = 'en' 
}: SubmissionMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([20.5937, 78.9629], 5); // Center on India

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapInstanceRef.current);
    }

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add markers for submissions
    submissions.forEach(submission => {
      if (!submission.location || !mapInstanceRef.current) return;

      const statusColor = {
        pending: '#f59e0b',
        verified: '#10b981', 
        rejected: '#ef4444',
      }[submission.status];

      // Create custom icon based on status
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${statusColor}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const marker = L.marker([submission.location.lat, submission.location.lng], {
        icon: customIcon,
      }).addTo(mapInstanceRef.current);

      // Create popup content
      const popupContent = `
        <div class="p-3 min-w-[200px]">
          <h3 class="font-semibold text-sm mb-2">${submission.farmName}</h3>
          <div class="space-y-1 text-xs">
            <div><span class="font-medium">${language === 'hi' ? 'किसान:' : 'Farmer:'}</span> ${submission.farmerName}</div>
            <div><span class="font-medium">${language === 'hi' ? 'फसल:' : 'Crop:'}</span> ${submission.cropType}</div>
            <div><span class="font-medium">${language === 'hi' ? 'आकार:' : 'Size:'}</span> ${submission.landSize} ha</div>
            <div><span class="font-medium">${language === 'hi' ? 'क्रेडिट:' : 'Credits:'}</span> ${submission.carbonCredits.toFixed(2)} t CO₂e</div>
            <div class="mt-2">
              <span class="inline-block px-2 py-1 rounded text-xs text-white" style="background-color: ${statusColor}">
                ${language === 'hi' ? 
                  (submission.status === 'pending' ? 'लंबित' : submission.status === 'verified' ? 'सत्यापित' : 'अस्वीकृत') :
                  submission.status.charAt(0).toUpperCase() + submission.status.slice(1)
                }
              </span>
            </div>
            <button 
              onclick="window.selectSubmission('${submission.id}')" 
              class="mt-2 w-full bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
            >
              ${language === 'hi' ? 'विस्तार देखें' : 'View Details'}
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      markersRef.current.push(marker);
    });

    // Global function for popup button clicks
    (window as any).selectSubmission = (submissionId: string) => {
      onSubmissionSelect(submissionId);
    };

    // Fit map to show all markers
    if (markersRef.current.length > 0) {
      const group = new L.FeatureGroup(markersRef.current);
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    }

    return () => {
      // Cleanup function
      delete (window as any).selectSubmission;
    };
  }, [submissions, onSubmissionSelect, language]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full h-96 md:h-[500px] border rounded-lg overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
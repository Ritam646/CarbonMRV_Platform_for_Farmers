import jsPDF from 'jspdf';
import Papa from 'papaparse';
import { CarbonEstimate, Farm, Farmer, Submission } from './supabase';

export interface ReportData {
  farmer: Farmer;
  farm: Farm;
  submission: Submission;
  estimate: CarbonEstimate;
}

export class ReportGenerator {
  static async generatePDF(data: ReportData[]): Promise<Blob> {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    let yPosition = 20;

    // Header
    doc.setFontSize(20);
    doc.text('CarbonMRV+ Report', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPosition);
    yPosition += 20;

    // Summary
    const totalCredits = data.reduce((sum, item) => sum + item.estimate.carbon_credits, 0);
    const totalArea = data.reduce((sum, item) => sum + item.farm.land_size, 0);
    
    doc.setFontSize(14);
    doc.text('Summary', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.text(`Total Farmers: ${data.length}`, 20, yPosition);
    yPosition += 5;
    doc.text(`Total Area: ${totalArea.toFixed(2)} hectares`, 20, yPosition);
    yPosition += 5;
    doc.text(`Total Carbon Credits: ${totalCredits.toFixed(2)} tonnes CO2e`, 20, yPosition);
    yPosition += 15;

    // Individual Reports
    doc.setFontSize(14);
    doc.text('Individual Farm Reports', 20, yPosition);
    yPosition += 10;

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(12);
      doc.text(`${i + 1}. ${item.farmer.name}`, 20, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.text(`Farm: ${item.farm.name}`, 25, yPosition);
      yPosition += 5;
      doc.text(`Crop: ${item.farm.crop_type}`, 25, yPosition);
      yPosition += 5;
      doc.text(`Area: ${item.farm.land_size} ha`, 25, yPosition);
      yPosition += 5;
      doc.text(`Carbon Credits: ${item.estimate.carbon_credits.toFixed(2)} tonnes CO2e`, 25, yPosition);
      yPosition += 5;
      doc.text(`Confidence: ${(item.estimate.confidence_score * 100).toFixed(1)}%`, 25, yPosition);
      yPosition += 10;
    }

    return doc.output('blob');
  }

  static generateCSV(data: ReportData[]): Blob {
    const csvData = data.map(item => ({
      'Farmer Name': item.farmer.name,
      'Farm Name': item.farm.name,
      'Crop Type': item.farm.crop_type,
      'Land Size (ha)': item.farm.land_size,
      'GPS Latitude': item.farm.gps_location?.y || '',
      'GPS Longitude': item.farm.gps_location?.x || '',
      'Submission Date': new Date(item.submission.submission_date).toLocaleDateString(),
      'Biomass Estimate (tonnes CO2)': item.estimate.biomass_estimate.toFixed(2),
      'Methane Emission Reduction (tonnes CO2e)': item.estimate.methane_emission.toFixed(2),
      'Total Carbon Credits (tonnes CO2e)': item.estimate.carbon_credits.toFixed(2),
      'Confidence Score': (item.estimate.confidence_score * 100).toFixed(1) + '%',
      'Status': item.submission.status,
      'Contact': item.farmer.contact || '',
    }));

    const csv = Papa.unparse(csvData);
    return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  }

  static async uploadReport(blob: Blob, filename: string): Promise<string> {
    // In a real implementation, this would upload to Supabase storage
    // For now, we'll create a temporary URL
    return URL.createObjectURL(blob);
  }
}
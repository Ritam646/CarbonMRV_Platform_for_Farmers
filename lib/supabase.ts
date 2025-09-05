import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const createSupabaseClient = () => {
  return createClientComponentClient();
};

// Database types
export interface Farmer {
  id: string;
  name: string;
  contact?: string;
  language: string;
  auth_id: string;
  role: 'farmer' | 'verifier' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Farm {
  id: string;
  farmer_id: string;
  name: string;
  crop_type: string;
  land_size: number;
  gps_location?: { x: number; y: number };
  practices: Record<string, any>;
  images: string[];
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: string;
  farm_id: string;
  submission_date: string;
  raw_data: Record<string, any>;
  remote_sensing_data: Record<string, any>;
  status: 'pending' | 'verified' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface CarbonEstimate {
  id: string;
  submission_id: string;
  biomass_estimate: number;
  methane_emission: number;
  carbon_credits: number;
  confidence_score: number;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  estimate_id: string;
  report_type: 'pdf' | 'csv';
  report_url?: string;
  generated_by?: string;
  created_at: string;
}
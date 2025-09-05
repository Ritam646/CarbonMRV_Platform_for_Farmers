/*
  # CarbonMRV+ Database Schema

  1. New Tables
    - `farmers` - Store farmer profile information
      - `id` (uuid, primary key) 
      - `name` (text) - Farmer's name
      - `contact` (text) - Phone/email contact
      - `language` (text) - Preferred language (en/hi)
      - `auth_id` (uuid) - Links to Supabase auth
      - `created_at` (timestamp)
      
    - `farms` - Store farm details and practices
      - `id` (uuid, primary key)
      - `farmer_id` (uuid, foreign key to farmers)
      - `name` (text) - Farm name/identifier
      - `crop_type` (text) - Type of crop (rice, agroforestry, etc)
      - `land_size` (decimal) - Farm size in hectares
      - `gps_location` (point) - GPS coordinates
      - `practices` (jsonb) - Farming practices data
      - `images` (text[]) - Array of image URLs
      - `created_at` (timestamp)
      
    - `submissions` - Store data submissions for MRV
      - `id` (uuid, primary key)
      - `farm_id` (uuid, foreign key to farms)
      - `submission_date` (timestamp)
      - `raw_data` (jsonb) - Raw submission data
      - `remote_sensing_data` (jsonb) - Satellite/remote sensing data
      - `status` (text) - pending, verified, rejected
      - `created_at` (timestamp)
      
    - `carbon_estimates` - Store AI-generated carbon estimates  
      - `id` (uuid, primary key)
      - `submission_id` (uuid, foreign key to submissions)
      - `biomass_estimate` (decimal) - Estimated biomass in tonnes
      - `methane_emission` (decimal) - Methane emission reduction
      - `carbon_credits` (decimal) - Calculated carbon credits
      - `confidence_score` (decimal) - AI confidence (0-1)
      - `created_at` (timestamp)
      
    - `reports` - Store generated reports
      - `id` (uuid, primary key)
      - `estimate_id` (uuid, foreign key to carbon_estimates)
      - `report_type` (text) - pdf, csv
      - `report_url` (text) - File URL
      - `generated_by` (uuid) - User who generated report
      - `created_at` (timestamp)
      
    - `mrv_templates` - Store MRV templates for vector search
      - `id` (uuid, primary key)
      - `template_content` (text) - Template content
      - `embedding` (vector) - Vector embedding for search
      - `category` (text) - Template category
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users based on roles
    - Farmers can only access their own data
    - Verifiers can access all farmer data in read mode
*/

-- Create custom types
CREATE TYPE submission_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE report_type AS ENUM ('pdf', 'csv');
CREATE TYPE user_role AS ENUM ('farmer', 'verifier', 'admin');

-- Create tables
CREATE TABLE IF NOT EXISTS farmers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact text,
  language text DEFAULT 'en',
  auth_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role DEFAULT 'farmer',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS farms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid REFERENCES farmers(id) ON DELETE CASCADE,
  name text NOT NULL,
  crop_type text NOT NULL,
  land_size decimal(10,2) NOT NULL,
  gps_location point,
  practices jsonb DEFAULT '{}',
  images text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid REFERENCES farms(id) ON DELETE CASCADE,
  submission_date timestamptz DEFAULT now(),
  raw_data jsonb DEFAULT '{}',
  remote_sensing_data jsonb DEFAULT '{}',
  status submission_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS carbon_estimates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid REFERENCES submissions(id) ON DELETE CASCADE,
  biomass_estimate decimal(10,2) DEFAULT 0,
  methane_emission decimal(10,2) DEFAULT 0,
  carbon_credits decimal(10,2) DEFAULT 0,
  confidence_score decimal(3,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id uuid REFERENCES carbon_estimates(id) ON DELETE CASCADE,
  report_type report_type NOT NULL,
  report_url text,
  generated_by uuid REFERENCES farmers(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mrv_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_content text NOT NULL,
  category text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_farmers_auth_id ON farmers(auth_id);
CREATE INDEX IF NOT EXISTS idx_farms_farmer_id ON farms(farmer_id);
CREATE INDEX IF NOT EXISTS idx_submissions_farm_id ON submissions(farm_id);
CREATE INDEX IF NOT EXISTS idx_carbon_estimates_submission_id ON carbon_estimates(submission_id);
CREATE INDEX IF NOT EXISTS idx_reports_estimate_id ON reports(estimate_id);

-- Enable Row Level Security
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE carbon_estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE mrv_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for farmers table
CREATE POLICY "Farmers can read their own data"
  ON farmers FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_id);

CREATE POLICY "Farmers can update their own data"
  ON farmers FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_id);

CREATE POLICY "Users can insert their own farmer record"
  ON farmers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = auth_id);

CREATE POLICY "Verifiers can read all farmer data"
  ON farmers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM farmers 
      WHERE auth_id = auth.uid() 
      AND role IN ('verifier', 'admin')
    )
  );

-- RLS Policies for farms table
CREATE POLICY "Farmers can manage their own farms"
  ON farms FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM farmers 
      WHERE farmers.id = farms.farmer_id 
      AND farmers.auth_id = auth.uid()
    )
  );

CREATE POLICY "Verifiers can read all farms"
  ON farms FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM farmers 
      WHERE auth_id = auth.uid() 
      AND role IN ('verifier', 'admin')
    )
  );

-- RLS Policies for submissions table
CREATE POLICY "Farmers can manage submissions for their farms"
  ON submissions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM farms 
      JOIN farmers ON farms.farmer_id = farmers.id
      WHERE farms.id = submissions.farm_id 
      AND farmers.auth_id = auth.uid()
    )
  );

CREATE POLICY "Verifiers can read all submissions"
  ON submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM farmers 
      WHERE auth_id = auth.uid() 
      AND role IN ('verifier', 'admin')
    )
  );

-- RLS Policies for carbon_estimates table
CREATE POLICY "Users can read estimates for their submissions"
  ON carbon_estimates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM submissions s
      JOIN farms f ON s.farm_id = f.id
      JOIN farmers fr ON f.farmer_id = fr.id
      WHERE s.id = carbon_estimates.submission_id
      AND (fr.auth_id = auth.uid() OR EXISTS (
        SELECT 1 FROM farmers 
        WHERE auth_id = auth.uid() 
        AND role IN ('verifier', 'admin')
      ))
    )
  );

-- RLS Policies for reports table
CREATE POLICY "Users can access reports they generated or own"
  ON reports FOR SELECT
  TO authenticated
  USING (
    generated_by IN (
      SELECT id FROM farmers WHERE auth_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM farmers 
      WHERE auth_id = auth.uid() 
      AND role IN ('verifier', 'admin')
    )
  );

-- RLS Policies for mrv_templates table  
CREATE POLICY "All authenticated users can read templates"
  ON mrv_templates FOR SELECT
  TO authenticated
  USING (true);

-- Insert sample data
INSERT INTO mrv_templates (template_content, category) VALUES
('Rice cultivation carbon credit calculation template for flooded conditions', 'rice'),
('Agroforestry biomass estimation template for mixed species', 'agroforestry'),
('Methane emission reduction calculation for alternate wetting and drying', 'rice'),
('Tree plantation carbon sequestration template', 'agroforestry');
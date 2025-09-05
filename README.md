# CarbonMRV+ Platform for NABARD Hackathon

A comprehensive web application for Monitoring, Reporting, and Verification (MRV) in agroforestry and rice-based carbon projects in India. The platform provides farmer-friendly interfaces for data collection and verifier-ready tools for carbon credit estimation and reporting.

## Features

### 🌾 Farmer Dashboard
- **Mobile-first design** with offline support
- **Multi-language interface** (English + Hindi)
- **Farm management** with GPS location tracking
- **Crop data submission** with geo-tagged images
- **Carbon credit tracking** with AI-powered estimation
- **Farming practices documentation** (water management, fertilizer usage, agroforestry methods)

### 👨‍💼 Verifier Dashboard
- **Comprehensive submission review** in table and map views
- **AI-assisted carbon estimation** with confidence scores
- **Bulk verification workflows** with status management
- **Report generation** in PDF and CSV formats
- **Geospatial visualization** of farmer submissions
- **Aggregated analytics** and carbon credit summaries

### 🤖 AI/ML Integration
- **Biomass estimation** using IPCC methodologies
- **Methane emission calculations** for rice cultivation
- **Remote sensing integration** (placeholder for Sentinel/Landsat data)
- **Confidence scoring** for carbon estimates
- **HuggingFace embeddings** for template matching

### 📊 Reporting & Analytics
- **Automated PDF reports** for carbon registries
- **CSV data exports** for external analysis  
- **Dashboard statistics** and trend visualization
- **Template-based reporting** with vector search

## Tech Stack

- **Frontend**: Next.js 13+ with App Router, TailwindCSS, shadcn/ui
- **Backend**: Node.js with TypeScript, Supabase (PostgreSQL + Auth)
- **Database**: Supabase with Row Level Security (RLS)
- **Maps**: Leaflet.js for interactive mapping
- **AI/ML**: HuggingFace embeddings, IPCC carbon calculation formulas
- **Reports**: jsPDF for PDF generation, PapaParse for CSV export
- **Deployment**: Vercel (frontend) + Supabase (backend & database)

## Database Schema

### Core Tables
- `farmers` - User profiles with authentication
- `farms` - Farm details with GPS coordinates and practices
- `submissions` - Data submissions for MRV process
- `carbon_estimates` - AI-generated carbon credit calculations
- `reports` - Generated PDF/CSV reports
- `mrv_templates` - Templates for carbon calculation methods

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd carbonmrv-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Copy `.env.local.example` to `.env.local`
   - Add your Supabase URL and anon key

4. **Run database migrations**
   - In your Supabase dashboard, go to SQL Editor
   - Copy and run the SQL from `supabase/migrations/init_carbonmrv_schema.sql`

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   - Visit `http://localhost:3000`
   - Create a farmer or verifier account to get started

### Environment Variables

Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Usage

### For Farmers
1. **Sign up** with your details and select "Farmer" role
2. **Add farms** with crop types, land size, and GPS coordinates
3. **Document farming practices** (water management, fertilizer use, etc.)
4. **Upload field images** with geo-tagging
5. **View estimated carbon credits** based on your practices
6. **Track submission status** and verification results

### For Verifiers  
1. **Sign up** with "Verifier" role
2. **Review farmer submissions** in table or map view
3. **Verify carbon estimates** with AI confidence scores
4. **Approve or reject submissions** with status updates
5. **Generate reports** for carbon registries (PDF/CSV)
6. **Export bulk data** for external analysis

## API Integration Points

### Remote Sensing (Placeholder)
```typescript
// Future integration with Google Earth Engine or Sentinel data
const remoteSensingData = await CarbonEstimator.fetchRemoteSensingData({
  latitude: farm.gps_location.y,
  longitude: farm.gps_location.x,
});
```

### Carbon Estimation
```typescript
const carbonEstimate = await CarbonEstimator.estimateCarbon({
  cropType: 'rice',
  landSize: 2.5,
  practices: {
    waterManagement: 'alternate_wetting_drying',
    fertilizerUsage: 'organic',
  },
});
```

## Architecture

### File Structure
```
├── app/                    # Next.js 13 app directory
│   ├── dashboard/         # Farmer dashboard
│   ├── verifier/          # Verifier dashboard
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   ├── auth/             # Authentication forms
│   ├── farmer/           # Farmer-specific components  
│   ├── verifier/         # Verifier-specific components
│   └── layout/           # Navigation and layout
├── lib/                  # Core utilities and integrations
│   ├── auth.ts           # Authentication helpers
│   ├── supabase.ts       # Database client and types
│   ├── carbon-estimation.ts # AI/ML carbon calculations
│   ├── report-generator.ts  # PDF/CSV report generation
│   └── i18n.ts           # Internationalization
└── supabase/
    └── migrations/       # Database schema and migrations
```

### Security Features
- **Row Level Security (RLS)** on all database tables
- **Role-based access control** (farmer, verifier, admin)
- **Authenticated API endpoints** with user context
- **Input validation** with Zod schemas
- **Secure file uploads** to Supabase storage

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or support, please create an issue in the GitHub repository or contact the development team.

---

**CarbonMRV+** - Empowering sustainable agriculture through transparent carbon credit management.

// Internationalization support for English and Hindi

export const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    farms: 'My Farms',
    submissions: 'Submissions',
    reports: 'Reports',
    profile: 'Profile',
    signOut: 'Sign Out',
    
    // Farmer Dashboard
    welcomeBack: 'Welcome back',
    totalFarms: 'Total Farms',
    totalCredits: 'Carbon Credits',
    pendingSubmissions: 'Pending Submissions',
    addNewFarm: 'Add New Farm',
    
    // Farm Form
    farmDetails: 'Farm Details',
    farmName: 'Farm Name',
    cropType: 'Crop Type',
    landSize: 'Land Size (hectares)',
    gpsLocation: 'GPS Location',
    getCurrentLocation: 'Get Current Location',
    farmingPractices: 'Farming Practices',
    waterManagement: 'Water Management',
    fertilizerUsage: 'Fertilizer Usage',
    uploadImages: 'Upload Field Images',
    
    // Crop Types
    rice: 'Rice',
    agroforestry: 'Agroforestry',
    mixedCrops: 'Mixed Crops',
    vegetables: 'Vegetables',
    
    // Water Management
    continuousFlooding: 'Continuous Flooding',
    alternateWettingDrying: 'Alternate Wetting & Drying',
    rainfed: 'Rainfed',
    
    // Actions
    save: 'Save',
    submit: 'Submit',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    view: 'View',
    download: 'Download',
    
    // Status
    pending: 'Pending',
    verified: 'Verified',
    rejected: 'Rejected',
    
    // Verifier Dashboard
    farmerSubmissions: 'Farmer Submissions',
    mapView: 'Map View',
    tableView: 'Table View',
    generateReport: 'Generate Report',
    exportPDF: 'Export PDF',
    exportCSV: 'Export CSV',
    
    // Messages
    success: 'Success',
    error: 'Error',
    loading: 'Loading...',
    noData: 'No data available',
    
    // Tooltips
    carbonCreditsTooltip: 'Estimated carbon credits based on your farming practices',
    confidenceTooltip: 'AI confidence level in the estimation',
  },
  
  hi: {
    // Navigation (Hindi)
    dashboard: 'डैशबोर्ड',
    farms: 'मेरे खेत',
    submissions: 'प्रस्तुतियाँ',
    reports: 'रिपोर्ट',
    profile: 'प्रोफाइल',
    signOut: 'साइन आउट',
    
    // Farmer Dashboard
    welcomeBack: 'वापसी पर स्वागत है',
    totalFarms: 'कुल खेत',
    totalCredits: 'कार्बन क्रेडिट',
    pendingSubmissions: 'लंबित प्रस्तुतियाँ',
    addNewFarm: 'नया खेत जोड़ें',
    
    // Farm Form  
    farmDetails: 'खेत का विवरण',
    farmName: 'खेत का नाम',
    cropType: 'फसल का प्रकार',
    landSize: 'भूमि का आकार (हेक्टेयर)',
    gpsLocation: 'जीपीएस स्थान',
    getCurrentLocation: 'वर्तमान स्थान प्राप्त करें',
    farmingPractices: 'कृषि पद्धतियाँ',
    waterManagement: 'जल प्रबंधन',
    fertilizerUsage: 'उर्वरक का उपयोग',
    uploadImages: 'खेत की तस्वीरें अपलोड करें',
    
    // Crop Types
    rice: 'धान',
    agroforestry: 'कृषि वानिकी',
    mixedCrops: 'मिश्रित फसल',
    vegetables: 'सब्जियाँ',
    
    // Water Management
    continuousFlooding: 'निरंतर बाढ़',
    alternateWettingDrying: 'वैकल्पिक गीला और सूखा',
    rainfed: 'वर्षा आधारित',
    
    // Actions
    save: 'सहेजें',
    submit: 'प्रस्तुत करें',
    cancel: 'रद्द करें',
    edit: 'संपादित करें',
    delete: 'हटाएं',
    view: 'देखें',
    download: 'डाउनलोड',
    
    // Status
    pending: 'लंबित',
    verified: 'सत्यापित',
    rejected: 'अस्वीकृत',
    
    // Verifier Dashboard
    farmerSubmissions: 'किसान प्रस्तुतियाँ',
    mapView: 'नक्शा दृश्य',
    tableView: 'तालिका दृश्य',
    generateReport: 'रिपोर्ट तैयार करें',
    exportPDF: 'पीडीएफ निर्यात',
    exportCSV: 'सीएसवी निर्यात',
    
    // Messages
    success: 'सफलता',
    error: 'त्रुटि',
    loading: 'लोड हो रहा है...',
    noData: 'कोई डेटा उपलब्ध नहीं',
    
    // Tooltips
    carbonCreditsTooltip: 'आपकी कृषि पद्धतियों के आधार पर अनुमानित कार्बन क्रेडिट',
    confidenceTooltip: 'अनुमान में AI विश्वास स्तर',
  }
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;

export const useTranslation = (language: Language = 'en') => {
  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.en[key];
  };

  return { t };
};
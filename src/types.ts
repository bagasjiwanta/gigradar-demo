// API Response Types
export interface ApiResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  items: Freelancer[];
}

export interface Freelancer {
  _id: string;
  recno: number;
  ciphertext: string;
  shortName: string;
  title: string;
  description: string;
  portrait: string;
  location: Location;
  hourlyRate: HourlyRate;
  avgFeedbackScore: number;
  lastActivity: string;
  totalHoursBilled: number;
  totalFeedbacks: number;
  totalPortfolioItems: number;
  totalPassedTests: number;
  skills: any[];
  groups: any;
  agencies: Agency[];
  type: number;
  recentAvgFeedbackScore: number;
  recentTotalFeedbacks: number;
  recentHoursBilled: number;
  topRatedStatus: string;
  billedAssignments: number;
  totalRevenue: number;
  combinedTotalRevenue: number;
  totalHourlyJobs: number;
  totalFpJobs: number;
  curAssignments: number;
  combinedTotalEarnings: number;
  combinedRecentEarnings: number;
  combinedAverageRecentEarnings: number;
  combinedRecentCharge: number;
  combinedAverageRecentCharge: number;
  totalJobs: number;
  memberSince: string;
  totalCompletedJobs: number;
  avgQualityScore: number;
  avgSkillsScore: number;
  avgCooperationScore: number;
  avgAvailabilityScore: number;
  avgCommunicationScore: number;
  avgDeadlinesScore: number;
  contractToHire: boolean;
  openingContracts: number;
  workingYears: number;
  jobFinished: number;
  pendingInvitations: number;
  isVetted: boolean;
  isPIBAvailable: boolean;
  isServiceProfile: boolean;
  serviceProfileNames: string[];
  serviceProfiles: ServiceProfile[];
  attrSkills: AttributeSkill[];
  uid: string;
}

export interface Location {
  country: string;
  city: string;
  state: string;
  countryCode: string;
}

export interface HourlyRate {
  currencyCode: string;
  amount: number;
}

export interface Agency {
  recno: number;
  ciphertext: string | null;
  name: string;
  agencyDiversityCertificates: any;
}

export interface ServiceProfile {
  occupation: {
    uid: string;
    prefLabel: string;
  };
  title: string;
  description: string;
  hourlyRate: HourlyRate;
  aggregates: {
    totalCharge: number;
    totalJobs: number;
    totalHours: number;
  };
}

export interface AttributeSkill {
  groupName: string;
  skills: {
    skill: {
      hlPrettyName: string;
      prettyName: string;
      name: string;
      slugName: string | null;
      uid: string;
    };
  }[];
}

// Google Sheets Row Format - matches the reference spreadsheet
export interface SheetRow {
  ciphertext: string;
  doNotDelete: string;
  shortName: string;
  companyFullName: string;
  upworkUrl: string;
  status: string;
  date: string;
  firstName: string;
  lastName: string;
  freelancer: string;
  email: string;
  phone: string;
  companyPhone: string;
  jobTitle: string;
  department: string;
  seniorityLevel: string;
  persona: string;
  companyShort: string;
  companyS: string;
  secondPersonFull: string;
  secondPersonFirst: string;
  website: string;
  companyCountry: string;
  companyLinkedin: string;
  prospectLinkedin: string;
  sourceUrl: string;
  industry: string;
  companySize: string;
  solutions: string;
  signOff: string;
  signOffForward: string;
  daytime: string;
  client1: string;
  client2: string;
  client3: string;
  combinedTotalRevenue: string;
  totalHourlyJobs: string;
  combinedRecentEarnings: string;
  workingYears: string;
  avgDeadlinesScore: string;
  serviceProfileNames: string;
  agencyTopRatedStatus: string;
  summarySanitized: string;
  skill1: string;
  skill2: string;
  memberSinceRaw: string;
  memberSinceFormatted: string;
  combinedRecentEarningsTemp: string;
  combinedTotalRevenueTemp: string;
  description: string;
  avgFeedbackScore: string;
  companyLogo: string;
  owner: string;
  researchCampaign: string;
  created: string;
  lastModified: string;
}

// Analysis Results
export interface VariableImpact {
  name: string;
  impact: number;
  correlation?: number;
}

export interface TopFreelancer {
  name: string;
  ciphertext: string;
  earnings: number;
}
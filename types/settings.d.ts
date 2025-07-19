export interface AppSettings {
  general: {
    appName: string;
    appDescription: string;
    appLogo: string;
    contactEmail: string;
    maintenanceMode: boolean;
  };
  moderation: {
    autoModeration: boolean;
    bannedWords: string[];
    maxReportsBeforeSuspension: number;
    requireApprovalForNewUsers: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    messageNotifications: boolean;
    forumNotifications: boolean;
    marketingEmails: boolean;
    digestFrequency: string;
  };
  upload: {
    maxImageSize: number;
    allowedFormats: string[];
    maxImagesPerListing: number;
    imageQuality: number;
  };
  security: {
    maxLoginAttempts: number;
    lockoutDuration: number;
    sessionTimeout: number;
    requireEmailVerification: boolean;
    twoFactorEnabled: boolean;
  };
  forum: {
    maxQuestionsPerDay: number;
    maxAnswersPerQuestion: number;
    pointsSystem: boolean;
    allowAnonymousQuestions: boolean;
  };
  listings: {
    maxListingsPerUser: number;
    autoExpireDays: number;
    requireApproval: boolean;
    allowPriceNegotiation: boolean;
    featuredListingPrice: number;
  };
}

export interface SettingsServiceResponse {
  success: boolean;
  data?: AppSettings;
  error?: string;
}

export interface SettingsUpdateResponse {
  success: boolean;
  error?: string;
}

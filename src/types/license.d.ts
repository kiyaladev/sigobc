export interface LicenseInfo {
  machineId: string;
  companyName: string;
  email: string;
  activationDate: string;
  expirationDate: string;
  licenseType: 'trial' | 'standard' | 'premium' | 'enterprise';
  maxUsers?: number;
}

export interface LicenseValidation {
  valid: boolean;
  licenseInfo?: LicenseInfo;
  error?: string;
  daysRemaining?: number;
}

export interface LicenseActivationResult {
  success: boolean;
  error?: string;
}

declare global {
  interface Window {
    licenseAPI: {
      getMachineId: () => Promise<string>;
      activateLicense: (licenseKey: string) => Promise<LicenseActivationResult>;
      validateLicense: () => Promise<LicenseValidation>;
      getLicenseInfo: () => Promise<LicenseInfo | null>;
      deactivateLicense: () => Promise<boolean>;
      generateTrialLicense: (companyName: string, email: string) => Promise<string>;
    };
  }
}

export {};


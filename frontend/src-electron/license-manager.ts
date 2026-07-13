import os from 'os';
import crypto from 'crypto';

interface LicenseInfo {
  companyName?: string;
  email?: string;
  expirationDate?: Date;
  licenseType?: string;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
  daysRemaining?: number;
}

export class LicenseManager {
  private static instance: LicenseManager;
  private licenseInfo: LicenseInfo | null = null;

  private constructor() {
    this.licenseInfo = this.createDefaultLicenseInfo();
  }

  static getInstance(): LicenseManager {
    if (!LicenseManager.instance) {
      LicenseManager.instance = new LicenseManager();
    }
    return LicenseManager.instance;
  }

  getMachineId(): string {
    // Générer un ID unique basé sur les infos de la machine
    const hostname = os.hostname();
    const platform = os.platform();
    const arch = os.arch();
    const cpus = os.cpus()[0]?.model || '';

    const machineString = `${hostname}-${platform}-${arch}-${cpus}`;
    return crypto.createHash('sha256').update(machineString).digest('hex');
  }

  private createDefaultLicenseInfo(): LicenseInfo {
    return {
      companyName: 'Mairie',
      email: 'support@tresor.ci',
      expirationDate: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000),
      licenseType: 'standard',
    };
  }

  activateLicense(_unused?: string): ValidationResult {
    this.licenseInfo = this.createDefaultLicenseInfo();
    return { valid: true, daysRemaining: 36500 };
  }

  validateLicense(): ValidationResult {
    this.licenseInfo ??= this.createDefaultLicenseInfo();
    return { valid: true, daysRemaining: 36500 };
  }

  getLicenseInfo(): LicenseInfo | null {
    this.licenseInfo ??= this.createDefaultLicenseInfo();
    return this.licenseInfo;
  }

  deactivateLicense(): boolean {
    this.licenseInfo = this.createDefaultLicenseInfo();
    return true;
  }

  generateTrialLicense(_companyName?: string, _email?: string): ValidationResult {
    this.licenseInfo = this.createDefaultLicenseInfo();
    return { valid: true, daysRemaining: 36500 };
  }
}

// Export par défaut pour compatibilité
export default LicenseManager;

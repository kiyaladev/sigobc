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
    // Initialisation
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  activateLicense(_licenseKey: string): ValidationResult {
    // TODO: Implémenter la validation de la clé de licence
    try {
      // Pour l'instant, accepter toutes les clés
      this.licenseInfo = {
        companyName: 'Demo Company',
        email: 'demo@example.com',
        expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 an
        licenseType: 'standard',
      };

      return {
        valid: true,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      return {
        valid: false,
        error: 'Clé de licence invalide: ' + errorMessage,
      };
    }
  }

  validateLicense(): ValidationResult {
    if (process.env.DEV) {
      return { valid: true };
    }

    if (!this.licenseInfo || !this.licenseInfo.expirationDate) {
      return {
        valid: false,
        error: 'Aucune licence trouvée',
      };
    }

    const now = new Date();
    const expirationDate = new Date(this.licenseInfo.expirationDate);

    if (now > expirationDate) {
      return {
        valid: false,
        error: 'Licence expirée',
      };
    }

    const daysRemaining = Math.floor((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      valid: true,
      daysRemaining,
    };
  }

  getLicenseInfo(): LicenseInfo | null {
    return this.licenseInfo;
  }

  deactivateLicense(): boolean {
    this.licenseInfo = null;
    return true;
  }

  generateTrialLicense(companyName: string, email: string): ValidationResult {
    try {
      this.licenseInfo = {
        companyName,
        email,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
        licenseType: 'trial',
      };

      return {
        valid: true,
        daysRemaining: 30,
      };
    } catch (_error: unknown) {
      const errorMessage = _error instanceof Error ? _error.message : 'Erreur inconnue';
      return {
        valid: false,
        error: 'Erreur lors de la génération de la licence d\'essai: ' + errorMessage,
      };
    }
  }
}

// Export par défaut pour compatibilité
export default LicenseManager;


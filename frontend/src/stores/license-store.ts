import { defineStore } from 'pinia';
import type { LicenseInfo, LicenseValidation } from '../types/license';

interface LicenseState {
  licenseInfo: LicenseInfo | null;
  validation: LicenseValidation | null;
  isChecking: boolean;
}

export const useLicenseStore = defineStore('license', {
  state: (): LicenseState => ({
    licenseInfo: null,
    validation: null,
    isChecking: false,
  }),

  getters: {
    isLicensed: (state): boolean => {
      return state.validation?.valid ?? false;
    },

    daysRemaining: (state): number | undefined => {
      return state.validation?.daysRemaining;
    },

    isExpiringSoon: (state): boolean => {
      const days = state.validation?.daysRemaining;
      return days !== undefined && days <= 30;
    },

    licenseType: (state): string | undefined => {
      return state.licenseInfo?.licenseType;
    },

    companyName: (state): string | undefined => {
      return state.licenseInfo?.companyName;
    },
  },

  actions: {
    checkLicense(): void {
      // Licence vérifiée automatiquement - aucune demande d'activation
      this.isChecking = true;
      try {
        this.validation = {
          valid: true,
          licenseInfo: {
            machineId: 'local',
            companyName: 'Mairie',
            email: 'support@tresor.ci',
            activationDate: new Date().toISOString(),
            expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            licenseType: 'standard',
          },
        };
      } finally {
        this.isChecking = false;
      }
    },

    refreshLicense(): void {
      this.checkLicense();
    },

    clearLicense(): void {
      this.licenseInfo = null;
      this.validation = null;
    },
  },
});

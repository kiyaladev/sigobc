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
    async checkLicense(): Promise<void> {
      if (!window.licenseAPI) {
        console.warn('License API not available');
        return;
      }

      this.isChecking = true;

      try {
        this.validation = await window.licenseAPI.validateLicense();

        if (this.validation.valid && this.validation.licenseInfo) {
          this.licenseInfo = this.validation.licenseInfo;
        } else {
          this.licenseInfo = null;
        }
      } catch (error) {
        console.error('Error checking license:', error);
        this.validation = {
          valid: false,
          error: 'Erreur lors de la vérification de la licence',
        };
      } finally {
        this.isChecking = false;
      }
    },

    async refreshLicense(): Promise<void> {
      await this.checkLicense();
    },

    clearLicense(): void {
      this.licenseInfo = null;
      this.validation = null;
    },
  },
});


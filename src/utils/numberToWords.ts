/**
 * Convertit un nombre en lettres en français
 * @param num - Le nombre à convertir (de 0 à 999 999 999 999)
 * @returns La représentation en lettres du nombre
 */
export function numberToWords(num: number): string {
  if (num === 0) return 'zéro';
  if (num < 0) return 'moins ' + numberToWords(Math.abs(num));
  if (!Number.isInteger(num)) {
    const parts = num.toString().split('.');
    const integerPart = numberToWords(parseInt(parts[0] || '0'));
    const decimalPart = parts[1];
    return `${integerPart} virgule ${(decimalPart || '')
      .split('')
      .map((d) => numberToWords(parseInt(d)))
      .join(' ')}`;
  }

  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
  const teens = [
    'dix',
    'onze',
    'douze',
    'treize',
    'quatorze',
    'quinze',
    'seize',
    'dix-sept',
    'dix-huit',
    'dix-neuf',
  ];
  const tens = [
    '',
    '',
    'vingt',
    'trente',
    'quarante',
    'cinquante',
    'soixante',
    'soixante',
    'quatre-vingt',
    'quatre-vingt',
  ];

  function convertLessThanThousand(n: number): string {
    if (n === 0) return '';
    if (n < 10) return units[n] || '';
    if (n < 20) return teens[n - 10] || '';

    if (n < 100) {
      const ten = Math.floor(n / 10);
      const unit = n % 10;

      if (ten === 7 || ten === 9) {
        // 70-79 et 90-99 cas particuliers
        const base = tens[ten];
        const remainder = ten === 7 ? n - 60 : n - 80;
        if (remainder < 10) {
          return base + '-' + units[remainder];
        } else if (remainder < 20) {
          return base + '-' + teens[remainder - 10];
        }
      }

      if (unit === 0) {
        return tens[ten] + (ten === 8 ? 's' : ''); // quatre-vingts
      }
      if (unit === 1 && ten < 8) {
        return tens[ten] + '-et-un';
      }
      return tens[ten] + '-' + units[unit];
    }

    // 100-999
    const hundred = Math.floor(n / 100);
    const remainder = n % 100;

    let result = '';
    if (hundred === 1) {
      result = 'cent';
    } else {
      result = units[hundred] + '-cent';
    }

    if (remainder === 0 && hundred > 1) {
      result += 's'; // deux-cents, trois-cents, etc.
    } else if (remainder > 0) {
      const remainderText = convertLessThanThousand(remainder);
      result += '-' + remainderText;
    }

    return result;
  }

  function convert(n: number): string {
    if (n === 0) return '';

    // Milliards
    if (n >= 1000000000) {
      const billions = Math.floor(n / 1000000000);
      const remainder = n % 1000000000;
      let result = '';

      if (billions === 1) {
        result = 'un-milliard';
      } else {
        result = convertLessThanThousand(billions) + '-milliards';
      }

      if (remainder > 0) {
        result += '-' + convert(remainder);
      }
      return result;
    }

    // Millions
    if (n >= 1000000) {
      const millions = Math.floor(n / 1000000);
      const remainder = n % 1000000;
      let result = '';

      if (millions === 1) {
        result = 'un-million';
      } else {
        result = convertLessThanThousand(millions) + '-millions';
      }

      if (remainder > 0) {
        result += '-' + convert(remainder);
      }
      return result;
    }

    // Milliers
    if (n >= 1000) {
      const thousands = Math.floor(n / 1000);
      const remainder = n % 1000;
      let result = '';

      if (thousands === 1) {
        result = 'mille';
      } else {
        result = convertLessThanThousand(thousands) + '-mille';
      }

      if (remainder > 0) {
        result += '-' + convertLessThanThousand(remainder);
      }
      return result;
    }

    return convertLessThanThousand(n);
  }

  return convert(num);
}

/**
 * Convertit un montant en lettres avec la devise (pour les montants financiers)
 * @param amount - Le montant à convertir
 * @param currency - La devise (par défaut "francs CFA")
 * @returns Le montant en lettres avec la devise
 */
export function amountToWords(amount: number, currency: string = 'francs CFA'): string {
  const integerPart = Math.floor(amount);
  const decimalPart = Math.round((amount - integerPart) * 100);

  let result = numberToWords(integerPart) + ' ' + currency;

  if (decimalPart > 0) {
    result += ' et ' + numberToWords(decimalPart) + ' centimes';
  }

  return result;
}

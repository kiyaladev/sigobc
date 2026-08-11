/**
 * Convertit un nombre en lettres en français
 * @param num - Le nombre à convertir
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

  function convertLessThanHundred(n: number): string {
    if (n < 10) return units[n] || '';
    if (n < 20) return teens[n - 10] || '';

    const ten = Math.floor(n / 10);
    const unit = n % 10;

    // 70-79 et 90-99 : la dizaine reprend soixante / quatre-vingt + 10..19
    if (ten === 7 || ten === 9) {
      const remainder = n - (ten === 7 ? 60 : 80); // 10..19
      // 71 = « soixante et onze », mais 91 = « quatre-vingt-onze » (sans « et »)
      const liaison = ten === 7 && remainder === 11 ? '-et-' : '-';
      return tens[ten] + liaison + teens[remainder - 10];
    }

    if (unit === 0) return tens[ten] + (ten === 8 ? 's' : ''); // quatre-vingts
    if (unit === 1 && ten < 8) return tens[ten] + '-et-un'; // vingt-et-un … soixante-et-un
    return tens[ten] + '-' + units[unit];
  }

  function convertLessThanThousand(n: number): string {
    if (n === 0) return '';
    if (n < 100) return convertLessThanHundred(n);

    const hundred = Math.floor(n / 100);
    const remainder = n % 100;

    let result = hundred === 1 ? 'cent' : units[hundred] + '-cent';
    if (remainder === 0) {
      if (hundred > 1) result += 's'; // deux-cents, trois-cents…
    } else {
      result += '-' + convertLessThanHundred(remainder);
    }
    return result;
  }

  /** « vingt » et « cent » sont invariables devant « mille » (adjectif numéral). */
  function invariable(s: string): string {
    return s.replace(/(vingt|cent)s$/, '$1');
  }

  function convert(n: number): string {
    if (n === 0) return '';

    if (n >= 1_000_000_000) {
      const billions = Math.floor(n / 1_000_000_000);
      const remainder = n % 1_000_000_000;
      // convert() (et non convertLessThanThousand) pour supporter au-delà de 999 milliards
      const result = billions === 1 ? 'un-milliard' : convert(billions) + '-milliards';
      return remainder > 0 ? result + '-' + convert(remainder) : result;
    }

    if (n >= 1_000_000) {
      const millions = Math.floor(n / 1_000_000);
      const remainder = n % 1_000_000;
      const result = millions === 1 ? 'un-million' : convert(millions) + '-millions';
      return remainder > 0 ? result + '-' + convert(remainder) : result;
    }

    if (n >= 1000) {
      const thousands = Math.floor(n / 1000);
      const remainder = n % 1000;
      const result =
        thousands === 1 ? 'mille' : invariable(convertLessThanThousand(thousands)) + '-mille';
      return remainder > 0 ? result + '-' + convertLessThanThousand(remainder) : result;
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

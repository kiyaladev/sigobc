/**
 * Détecte si l'application s'exécute dans Electron
 */
function isElectron(): boolean {
  // Méthodes de détection d'Electron
  if (
    typeof window !== 'undefined' &&
    typeof window.process === 'object' &&
    (window.process as { type?: string }).type === 'renderer'
  ) {
    return true;
  }

  // Détection via le userAgent
  if (
    typeof navigator === 'object' &&
    typeof navigator.userAgent === 'string' &&
    navigator.userAgent.indexOf('Electron') >= 0
  ) {
    return true;
  }

  // Détection via le protocole file://
  if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
    return true;
  }

  return false;
}

/**
 * Génère l'URL correcte pour les fichiers d'impression selon l'environnement
 * En mode Electron build, les fichiers sont dans le dossier public du build
 * En mode dev, les fichiers sont servis par le serveur de dev
 */
export function getPrintUrl(htmlFile: string, params?: Record<string, string | number>): string {
  // Nettoyer le chemin du fichier
  let cleanPath = htmlFile;
  if (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.substring(1);
  }

  // Construire la query string
  let queryString = '';
  if (params) {
    queryString =
      '?' +
      Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join('&');
  }

  // En mode Electron (protocole file://)
  if (isElectron() && window.location.protocol === 'file:') {
    // Extraire le chemin de base depuis l'URL actuelle
    // On doit enlever index.html et tout ce qui suit (hash, query params)
    const currentPath = window.location.href;
    let basePath = currentPath;

    if (currentPath.includes('index.html')) {
      basePath = currentPath.substring(0, currentPath.indexOf('index.html'));
    } else {
      // Fallback: si pas de index.html, on prend le dernier slash avant le hash/query
      const pathWithoutHash = currentPath.split('#')[0]?.split('?')[0] ?? currentPath;
      basePath = pathWithoutHash.substring(0, pathWithoutHash.lastIndexOf('/') + 1);
    }

    const fullUrl = basePath + cleanPath + queryString;
    console.log('[PrintUrl] Electron mode - URL:', fullUrl);
    return fullUrl;
  }

  // En mode dev ou web, utiliser le chemin avec /
  const url = '/' + cleanPath + queryString;
  console.log('[PrintUrl] Web mode - URL:', url);
  return url;
}

/**
 * Ouvre une fenêtre d'impression avec le bon URL selon l'environnement
 */
export function openPrintWindow(
  htmlFile: string,
  params?: Record<string, string | number>,
  windowName?: string,
): Window | null {
  const url = getPrintUrl(htmlFile, params);
  return window.open(url, windowName || '_blank');
}

/**
 * Envoie un message à une fenêtre avec des retries pour Electron
 * Cette fonction gère les problèmes de timing dans Electron où
 * l'événement 'load' peut ne pas être fiable
 */
export function sendMessageToWindow(
  targetWindow: Window,
  message: unknown,
  options?: { retries?: number; delay?: number },
): void {
  const retries = options?.retries ?? 5;
  const delay = options?.delay ?? 300;

  function attemptSend(attempt: number): void {
    if (attempt >= retries) {
      console.warn('[PrintUrl] Max retries reached for postMessage');
      return;
    }

    try {
      targetWindow.postMessage(message, '*');
      console.log(`[PrintUrl] Message sent (attempt ${attempt + 1})`);
    } catch (error) {
      console.warn(`[PrintUrl] postMessage failed (attempt ${attempt + 1}):`, error);
    }

    // Envoyer à nouveau après un délai pour s'assurer que le message est reçu
    if (attempt < retries - 1) {
      setTimeout(() => attemptSend(attempt + 1), delay);
    }
  }

  // Premier envoi après un court délai pour permettre à la fenêtre de se charger
  setTimeout(() => attemptSend(0), 200);
}

/**
 * Ouvre une fenêtre et envoie un message une fois chargée
 * Combine openPrintWindow et sendMessageToWindow avec une meilleure gestion du timing
 */
export function openPrintWindowWithData(
  htmlFile: string,
  params: Record<string, string | number> | undefined,
  message: unknown,
  windowName?: string,
): Window | null {
  const printWindow = openPrintWindow(htmlFile, params, windowName);

  if (printWindow) {
    // Attendre que la fenêtre soit chargée
    if (printWindow.addEventListener) {
      printWindow.addEventListener('load', () => {
        sendMessageToWindow(printWindow, message);
      });
    }
    // Aussi envoyer après un délai en cas de problème avec l'événement load
    sendMessageToWindow(printWindow, message, { retries: 5, delay: 500 });
  }

  return printWindow;
}

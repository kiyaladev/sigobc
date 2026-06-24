import type { QTableColumn } from 'quasar';

/**
 * Exporte des données en CSV et déclenche le téléchargement
 */
export function exportToCsv<T extends Record<string, unknown>>(
  rows: T[],
  columns: QTableColumn[],
  filename: string = 'export',
): void {
  // Filtrer les colonnes non-exportables (comme actions)
  const exportableColumns = columns.filter(
    (col) => col.name !== 'actions' && col.field !== 'actions',
  );

  // Créer l'en-tête CSV
  const header = exportableColumns.map((col) => `"${col.label}"`).join(';');

  // Créer les lignes de données
  const csvRows = rows.map((row) => {
    return exportableColumns
      .map((col) => {
        let value: unknown;

        // Récupérer la valeur selon le type de field
        if (typeof col.field === 'function') {
          value = col.field(row);
        } else if (col.field) {
          value = row[col.field];
        } else {
          value = row[col.name];
        }

        // Formater la valeur pour CSV
        if (value === null || value === undefined) {
          return '""';
        }

        if (value instanceof Date) {
          return `"${value.toLocaleDateString('fr-FR')}"`;
        }

        if (typeof value === 'number') {
          // Garder les nombres sans guillemets pour Excel
          return value.toString().replace('.', ',');
        }

        if (typeof value === 'object') {
          // Pour les objets, essayer JSON ou ignorer
          try {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          } catch {
            return '""';
          }
        }

        // Échapper les guillemets et encadrer avec des guillemets (string, boolean, etc.)
        const stringValue = String(value as string | boolean | bigint | symbol).replace(/"/g, '""');
        return `"${stringValue}"`;
      })
      .join(';');
  });

  // Assembler le contenu CSV avec BOM pour UTF-8
  const csvContent = '\uFEFF' + [header, ...csvRows].join('\n');

  // Créer le blob et télécharger
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

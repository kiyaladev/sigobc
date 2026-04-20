from pathlib import Path

root = Path(r'C:\Users\Coumbassa Stephane\Documents\GitHub\declarapp\frontend\src')
files = [
    root / 'components' / 'BordereauDialog.vue',
    root / 'components' / 'BordereauMandatDialog.vue',
    root / 'components' / 'DeclarationDialog.vue',
    root / 'components' / 'DemoBanner.vue',
    root / 'components' / 'LicenseDialog.vue',
    root / 'pages' / 'admin' / 'ParametragePage.vue',
    root / 'pages' / 'app3' / 'ChapitresPage.vue',
    root / 'pages' / 'app3' / 'FournisseursPage.vue',
    root / 'pages' / 'app3' / 'MandatsPage.vue',
    root / 'pages' / 'app3' / 'PrevisionPage.vue',
    root / 'pages' / 'app3' / 'ProjetsPage.vue',
    root / 'pages' / 'app3' / 'SousChapitresPage.vue',
    root / 'pages' / 'app6' / 'BordereauMandatsRecettePage.vue',
    root / 'pages' / 'app6' / 'BordereauxPage.vue',
    root / 'pages' / 'app6' / 'DeclarationsPage.vue',
    root / 'pages' / 'app6' / 'MandatsRecettePage.vue',
    root / 'pages' / 'app6' / 'PrevisionRecettesPage.vue',
    root / 'pages' / 'app6' / 'TaxesPage.vue',
    root / 'pages' / 'app7' / 'CongesPage.vue',
    root / 'pages' / 'app7' / 'EmployesPage.vue',
    root / 'pages' / 'app7' / 'OrdresMissionPage.vue',
    root / 'pages' / 'app7' / 'SalairesPage.vue',
    root / 'pages' / 'app7' / 'ServicesPage.vue',
    root / 'pages' / 'UtilisateursPage.vue',
]

replacements = {
    'class="dialog-card" style="min-width: 400px"': 'class="dialog-card" style="width: min(400px, 96vw); max-width: 96vw"',
    'class="dialog-card" style="min-width: 700px"': 'class="dialog-card" style="width: min(700px, 96vw); max-width: 96vw"',
    'style="min-width: 400px"': 'class="dialog-card" style="width: min(400px, 96vw); max-width: 96vw"',
    'style="min-width: 460px"': 'class="dialog-card" style="width: min(460px, 96vw); max-width: 96vw"',
    'style="min-width: 500px"': 'class="dialog-card" style="width: min(500px, 96vw); max-width: 96vw"',
    'style="min-width: 600px"': 'class="dialog-card" style="width: min(600px, 96vw); max-width: 96vw"',
    'style="min-width: 700px"': 'class="dialog-card" style="width: min(700px, 96vw); max-width: 96vw"',
    'style="min-width: 750px"': 'class="dialog-card" style="width: min(750px, 96vw); max-width: 96vw"',
    'style="min-width: 850px"': 'class="dialog-card" style="width: min(850px, 96vw); max-width: 96vw"',
    'style="min-width: 900px"': 'class="dialog-card" style="width: min(900px, 96vw); max-width: 96vw"',
    'style="min-width: 700px; max-width: 70vw"': 'class="dialog-card" style="width: min(700px, 96vw); max-width: 96vw"',
}

for file in files:
    text = file.read_text(encoding='utf-8')
    for old, new in replacements.items():
        text = text.replace(old, new)
    file.write_text(text, encoding='utf-8')

scss = root / 'css' / 'app.scss'
text = scss.read_text(encoding='utf-8')
needle = ".q-dialog .q-card-actions {\n  padding: 0 24px 24px;\n}\n\n.q-dialog .q-card > .q-card-section:first-child:not(.bg-warning):not(.bg-negative):not(.bg-positive) {\n  background: linear-gradient(135deg, rgba(27, 94, 59, 0.08), rgba(197, 168, 77, 0.12));\n}\n"
replacement = ".q-dialog .q-card-actions {\n  padding: 0 24px 24px;\n}\n\n.q-dialog .q-card-section.row.items-center.q-pb-none {\n  align-items: flex-start;\n  gap: 10px;\n  padding-top: 20px;\n  padding-bottom: 16px;\n  border-bottom: 1px solid rgba(148, 163, 184, 0.14);\n  background: linear-gradient(135deg, rgba(27, 94, 59, 0.08), rgba(197, 168, 77, 0.12));\n}\n\n.q-dialog .q-card-section.bg-primary,\n.q-dialog .q-card-section.bg-primary.text-white {\n  background: linear-gradient(135deg, rgba(27, 94, 59, 0.94), rgba(15, 118, 110, 0.92)) !important;\n}\n\n.q-dialog .q-card-section.accent-left {\n  background: linear-gradient(135deg, rgba(27, 94, 59, 0.08), rgba(197, 168, 77, 0.12));\n}\n\n.q-dialog .q-field .q-field__control,\n.q-dialog .q-banner {\n  border-radius: 14px;\n}\n\n.q-dialog .q-card > .q-card-section:first-child:not(.bg-warning):not(.bg-negative):not(.bg-positive) {\n  background: linear-gradient(135deg, rgba(27, 94, 59, 0.08), rgba(197, 168, 77, 0.12));\n}\n"
if needle in text:
    text = text.replace(needle, replacement)
scss.write_text(text, encoding='utf-8')

print('patched responsive dialogs')

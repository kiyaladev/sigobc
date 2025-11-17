# 🌱 Seeders de Test - Trésor App

## Vue d'ensemble

Les seeders permettent de générer des données de test réalistes pour l'application Trésor App. Ils sont essentiels pour :
- Tester l'application avec des données volumineuses
- Démontrer les fonctionnalités
- Développer sans avoir à saisir manuellement des données
- Tester les performances avec différents volumes de données

## 🚀 Utilisation via l'Interface Admin

### Accès

1. Connectez-vous en tant qu'administrateur (username: `admin`, password: `admin123`)
2. Accédez au menu **Administration** > **Seeders (Test)**
3. Vous arrivez sur la page de gestion des seeders

### Options disponibles

#### 1. Seeder Complet

Lance tous les seeders en une seule fois. Vous pouvez personnaliser le nombre d'enregistrements pour chaque table :

- **Utilisateurs** : Comptes d'utilisateurs (admin, gestionnaire, opérateur)
- **Mairies** : Communes et mairies avec coordonnées complètes
- **Personnel** : Agents municipaux associés aux mairies
- **Taxes** : Types de taxes (fixes et variables)
- **Déclarations** : Déclarations de recettes avec calculs automatiques
- **Bordereaux** : Bordereaux de paiement avec statuts variés

**Configuration par défaut :**
```
Utilisateurs:   10
Mairies:        15
Personnel:      30
Taxes:          25
Déclarations:   100
Bordereaux:     80
```

**⚠️ Attention :** Le seeder complet supprime **toutes** les données existantes avant de générer les nouvelles.

#### 2. Seeders Individuels

Permet de générer des données pour une seule table spécifique sans affecter les autres.

**Prérequis :**
- **Personnel** : Nécessite des mairies existantes
- **Taxes** : Nécessite des mairies existantes
- **Déclarations** : Nécessite des mairies ET des taxes
- **Bordereaux** : Nécessite des mairies ET des déclarations

#### 3. Statistiques Actuelles

Affiche le nombre d'enregistrements dans chaque table en temps réel.

#### 4. Logs d'exécution

Affiche les messages de progression et d'erreur lors de l'exécution des seeders.

## 💻 Utilisation Programmatique

### Import

```typescript
import { runAllSeeders, seedTable } from 'src/database/seeders';
```

### Exécuter tous les seeders

```typescript
// Avec les valeurs par défaut
await runAllSeeders();

// Avec des valeurs personnalisées
await runAllSeeders({
  utilisateurs: 20,
  mairies: 10,
  personnel: 50,
  taxes: 30,
  declarations: 200,
  bordereaux: 150,
});
```

### Exécuter un seeder individuel

```typescript
// Générer 50 utilisateurs
await seedTable('utilisateurs', 50);

// Générer 20 mairies
await seedTable('mairies', 20);

// Générer 100 déclarations (nécessite des mairies et taxes existantes)
await seedTable('declarations', 100);
```

### Seeders disponibles

```typescript
await seedUtilisateurs(10);        // 10 utilisateurs
await seedMairies(15);              // 15 mairies
await seedPersonnel(mairieIds, 30); // 30 personnels
await seedTaxes(mairieIds, 25);     // 25 taxes
await seedDeclarations(mairieIds, taxeIds, 100); // 100 déclarations
await seedBordereaux(mairieIds, declarationIds, 80); // 80 bordereaux
```

## 📊 Détails des Données Générées

### Utilisateurs

- **Rôles** : admin, gestionnaire, operateur (répartition aléatoire)
- **Statut** : 80% actifs, 20% inactifs
- **Email** : Format `prenom.nom@tresor.gov`
- **Mot de passe** : `password123` pour tous
- **Dernière connexion** : 70% ont une date, 30% jamais connectés

### Mairies

- **Villes** : 15 communes de La Réunion
- **Code** : Format `MAI001`, `MAI002`, etc.
- **Coordonnées** : Adresse, téléphone, email complets
- **Statut** : 90% actives, 10% inactives

### Personnel

- **Postes** : Maire, Adjoint, Secrétaire Général, Directeur, Chef de Service, etc.
- **Email** : Format `prenom.nom@mairie.re`
- **Téléphone** : Format réunionnais `0692 XX XX XX`
- **Date d'embauche** : Entre 2015 et aujourd'hui
- **Statut** : 85% actifs, 15% inactifs

### Taxes

- **Types fixes** : Taxe Foncière, Taxe d'Habitation, Ordures Ménagères, etc.
  - Montant : Entre 50€ et 500€
- **Types variables** : Taxe Professionnelle, CET, Taxe Véhicules, etc.
  - Taux : Entre 5% et 25%
- **Code** : Format `TXF001` (fixe) ou `TXV001` (variable)
- **Statut** : 90% actives, 10% inactives

### Déclarations

- **Numéro** : Format `DEC-2024-00001`
- **Types** : mensuelle, trimestrielle, annuelle
- **Montants** : 
  - HT : Entre 1 000€ et 50 000€
  - Taxe : 5% à 20% du HT
  - TTC : HT + Taxe
- **Statuts** : brouillon, soumise, validée, rejetée (répartition aléatoire)
- **Période** : Date générée entre 2023 et aujourd'hui
- **Observations** : 30% des déclarations ont des observations

### Bordereaux

- **Numéro** : Format `BOR-2024-00001`
- **Montant** : Entre 1 000€ et 100 000€
- **Modes de paiement** : chèque, virement, espèces, carte bancaire
- **Statuts** : en_attente, validé, encaissé, annulé
- **Date de validation** : Présente seulement si statut ≠ en_attente
- **Liaison déclaration** : 70% sont liés à une déclaration
- **Observations** : 40% ont des observations

## 🔧 Fonctions Utilitaires

Le fichier `seeders.ts` contient plusieurs fonctions utilitaires :

### randomDate()
```typescript
randomDate(start: Date, end: Date): Date
```
Génère une date aléatoire dans une plage.

### randomAmount()
```typescript
randomAmount(min: number, max: number): number
```
Génère un montant aléatoire (entier).

### randomChoice()
```typescript
randomChoice<T>(array: T[]): T
```
Choisit un élément aléatoire dans un tableau.

## 📝 Console Logs

Les seeders affichent des logs détaillés :

```
🚀 Démarrage des seeders...
🗑️  Nettoyage des tables...
🌱 Seeding 10 utilisateurs...
✅ 10 utilisateurs créés
🌱 Seeding 15 mairies...
✅ 15 mairies créées
...
✨ Tous les seeders ont été exécutés avec succès !
📊 Statistiques :
   - Utilisateurs: 10
   - Mairies: 15
   - Personnel: 30
   - Taxes: 25
   - Déclarations: 100
   - Bordereaux: 80
```

## ⚠️ Avertissements

1. **Suppression des données** : Les seeders suppriment toutes les données existantes
2. **Performances** : L'insertion de grands volumes peut prendre du temps
3. **Contraintes** : Respectez l'ordre des dépendances (mairies → personnel, etc.)
4. **Environnement** : À utiliser uniquement en développement/test

## 🎯 Cas d'usage

### Démo rapide
```typescript
await runAllSeeders({
  utilisateurs: 5,
  mairies: 5,
  personnel: 10,
  taxes: 10,
  declarations: 20,
  bordereaux: 15,
});
```

### Tests de charge
```typescript
await runAllSeeders({
  utilisateurs: 50,
  mairies: 30,
  personnel: 150,
  taxes: 100,
  declarations: 1000,
  bordereaux: 800,
});
```

### Test d'une fonctionnalité spécifique
```typescript
// Tester la gestion des déclarations
await seedMairies(10);
await seedTaxes(await db.mairies.toArray().then(m => m.map(x => x.id!)), 20);
await seedDeclarations(
  await db.mairies.toArray().then(m => m.map(x => x.id!)),
  await db.taxes.toArray().then(t => t.map(x => x.id!)),
  500
);
```

## 🔐 Sécurité

- L'accès à la page des seeders nécessite le rôle **admin**
- Les seeders ne doivent **jamais** être utilisés en production
- Les mots de passe générés sont simples (`password123`) - à usage de test uniquement

## 📚 Ressources

- **Fichier principal** : `src/database/seeders.ts`
- **Page admin** : `src/pages/AdminSeedersPage.vue`
- **Base de données** : `src/database/db.ts`

---

**Note** : Ce système de seeders utilise Dexie.js et IndexedDB. Les données sont stockées localement dans le navigateur.

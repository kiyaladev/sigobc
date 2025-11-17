# Trésor App - Logiciel de Gestion des Taxes Municipales

Application moderne de gestion des taxes municipales avec Quasar, Vue 3, TypeScript et Dexie.js (IndexedDB).

## 🎯 Fonctionnalités

### Authentification et Gestion des Utilisateurs
- ✅ Page de connexion moderne avec gradient
- ✅ Gestion du profil utilisateur
- ✅ Changement de mot de passe
- ✅ Gestion des rôles (Admin, Gestionnaire, Opérateur)
- ✅ Guards de navigation avec authentification

### Tableau de Bord
- ✅ Statistiques en temps réel (Mairies, Déclarations, Bordereaux, Montant total)
- ✅ Accès rapide aux modules principaux
- ✅ Déclarations récentes
- ✅ Bordereaux ouverts

### Gestion des Entités
- ✅ **Mairies** : CRUD complet avec recherche
- ✅ **Personnel** : Gestion du personnel municipal
- ✅ **Taxes** : Configuration des taxes (fixes et variables)
- ✅ **Déclarations** : Gestion des déclarations de recettes
- ✅ **Bordereaux** : Gestion des bordereaux de recettes

### Impression A4
- ✅ Impression professionnelle des déclarations de recettes
- ✅ Impression des bordereaux avec signatures
- ✅ Mise en page A4 optimisée

## 🗄️ Structure de la Base de Données (Dexie.js)

### Tables

1. **Mairies**
   - Code, Nom, Adresse, Ville, Code Postal
   - Téléphone, Email, Logo

2. **Personnel**
   - Nom, Prénom, Matricule, Fonction
   - Email, Téléphone
   - Lien avec Mairie

3. **Taxes**
   - Code, Libellé, Description
   - Type (fixe/variable), Taux/Montant
   - Lien avec Mairie

4. **Déclarations**
   - Numéro, Date, Période
   - Montants (HT, Taxe, TTC)
   - Statut (brouillon, validée, payée, annulée)
   - Liens avec Mairie, Taxe, Personnel, Bordereau

5. **Bordereaux**
   - Numéro, Date, Date de transmission
   - Montant total, Nombre de déclarations
   - Statut (ouvert, cloturé, transmis)
   - Liens avec Mairie, Personnel

6. **Utilisateurs**
   - Username, Password (hash)
   - Nom, Prénom, Email
   - Rôle (admin, gestionnaire, opérateur)
   - Dernière connexion

## 🚀 Installation

### Prérequis
- Node.js v20+ (recommandé v22 ou v24)
- npm ou pnpm
- Quasar CLI

### Étapes d'installation

1. **Cloner le projet**
   ```bash
   cd e:\Projects\TresorApp\trapp
   ```

2. **Installer les dépendances**
   ```bash
   pnpm install
   # ou
   npm install
   ```

3. **Lancer l'application en mode développement**
   ```bash
   pnpm dev
   # ou
   npm run dev
   ```

4. **Build pour la production**
   ```bash
   pnpm build
   # ou
   npm run build
   ```

## 👤 Compte de Démonstration

Par défaut, l'application crée un compte administrateur :

- **Username** : `admin`
- **Password** : `admin123`

> ⚠️ **Important** : Changez le mot de passe par défaut en production !

## 📱 Technologies Utilisées

- **Frontend** : Vue 3 (Composition API) + TypeScript
- **UI Framework** : Quasar v2
- **Base de données locale** : Dexie.js (IndexedDB)
- **State Management** : Pinia
- **Routing** : Vue Router 4
- **Build** : Vite

## 🎨 Design

L'application utilise :
- Design moderne avec Quasar Material Design
- Gradient personnalisé pour la page de connexion
- Menu latéral avec navigation intuitive
- Tables interactives avec recherche et filtres
- Formulaires réactifs avec validation
- Notifications toast pour les actions utilisateur

## 🖨️ Impression

Les fonctionnalités d'impression sont optimisées pour le format A4 :
- Déclarations de recettes avec en-tête, détails et pied de page
- Bordereaux avec bloc de signatures
- CSS media print pour masquer les éléments non imprimables
- Format professionnel adapté aux documents officiels

## 📁 Structure du Projet

```
trapp/
├── src/
│   ├── database/
│   │   └── db.ts                # Configuration Dexie + Modèles
│   ├── stores/
│   │   └── auth-store.ts        # Store Pinia pour l'authentification
│   ├── pages/
│   │   ├── LoginPage.vue        # Page de connexion
│   │   ├── DashboardPage.vue    # Tableau de bord
│   │   ├── ProfilePage.vue      # Profil utilisateur
│   │   ├── MairiesPage.vue      # Gestion des mairies
│   │   ├── PersonnelsPage.vue   # Gestion du personnel
│   │   ├── TaxesPage.vue        # Gestion des taxes
│   │   ├── DeclarationsPage.vue # Gestion des déclarations
│   │   └── BordereauxPage.vue   # Gestion des bordereaux
│   ├── layouts/
│   │   └── MainLayout.vue       # Layout principal avec menu
│   └── router/
│       ├── index.ts             # Configuration du router avec guards
│       └── routes.ts            # Définition des routes
```

## 🔐 Sécurité

- Authentification basée sur IndexedDB (local)
- Guards de navigation pour protéger les routes
- Validation des rôles utilisateurs
- Mots de passe (à hasher en production avec bcrypt)

> ⚠️ **Note** : Cette application stocke les données localement. Pour un environnement de production, il est recommandé d'implémenter :
> - Un backend avec API REST
> - JWT pour l'authentification
> - Hash des mots de passe avec bcrypt/argon2
> - Base de données serveur (PostgreSQL, MySQL, etc.)

## 📝 TODO / Améliorations Futures

- [ ] Compléter les pages Personnel et Taxes (CRUD complet)
- [ ] Page Statistiques avec graphiques
- [ ] Page Utilisateurs (gestion multi-utilisateurs)
- [ ] Export Excel/PDF des rapports
- [ ] Synchronisation avec backend (API REST)
- [ ] Dark mode
- [ ] Internationalisation (i18n)
- [ ] Tests unitaires et E2E

## 🤝 Support

Pour toute question ou problème, contactez l'équipe de développement.

---

**Version** : 1.0.0  
**Dernière mise à jour** : 7 novembre 2025  
**Développé avec** : ❤️ et Quasar Framework

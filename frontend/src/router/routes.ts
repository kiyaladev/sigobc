import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  // Route de connexion avec LoginLayout
  {
    path: '/login',
    component: () => import('layouts/LoginLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/LoginPage.vue'),
      },
    ],
  },

  // Routes principales avec layout
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      // Routes App3 - Gestion des Dépenses
      {
        path: '',
        redirect: '/app3/dashboard',
      },
      {
        path: 'utilisateurs',
        component: () => import('pages/UtilisateursPage.vue'),
        name: 'utilisateurs',
        meta: { requiresAdmin: true },
      },
      {
        path: 'admin/seeders',
        component: () => import('pages/admin/AdminSeedersPage.vue'),
        name: 'admin-seeders',
        meta: { requiresAdmin: true },
      },
      {
        path: 'admin/backup',
        component: () => import('pages/admin/BackupPage.vue'),
        name: 'admin-backup',
        meta: { allowAfterExpiration: true }, // Accessible même après expiration
      },
      {
        path: 'admin/parametrage',
        component: () => import('pages/admin/ParametragePage.vue'),
        name: 'admin-parametrage',
        meta: { requiresAdmin: true },
      },
      {
        path: 'statistiques',
        component: () => import('pages/StatistiquesGlobalesPage.vue'),
        name: 'statistiques-globales',
      },
      {
        path: 'app3/dashboard',
        component: () => import('pages/app3/DashboardPage.vue'),
        name: 'app3-dashboard',
      },
      {
        path: 'app3/chapitres',
        component: () => import('pages/app3/ChapitresPage.vue'),
        name: 'app3-chapitres',
      },
      {
        path: 'app3/sous-chapitres',
        component: () => import('pages/app3/SousChapitresPage.vue'),
        name: 'app3-sous-chapitres',
      },
      {
        path: 'app3/previsions',
        component: () => import('pages/app3/PrevisionPage.vue'),
        name: 'app3-previsions',
      },
      {
        path: 'app3/mandats',
        component: () => import('pages/app3/MandatsPage.vue'),
        name: 'app3-mandats',
      },
      {
        path: 'app3/bordereaux-mandats-gestion',
        component: () => import('pages/app3/BordereauxMandatsGestionPage.vue'),
        name: 'app3-bordereaux-mandats-gestion',
      },
      {
        path: 'app3/statistiques',
        component: () => import('pages/app3/StatistiquesPage.vue'),
        name: 'app3-statistiques',
      },
      {
        path: 'app3/projets',
        component: () => import('pages/app3/ProjetsPage.vue'),
        name: 'app3-projets',
      },
      {
        path: 'app3/fournisseurs',
        component: () => import('pages/app3/FournisseursPage.vue'),
        name: 'app3-fournisseurs',
      },
      // Routes App6 - Gestion des Recettes
      {
        path: 'app6/dashboard',
        component: () => import('pages/app6/DashboardPage.vue'),
        name: 'app6-dashboard',
      },
      {
        path: 'app6/declarations',
        component: () => import('pages/app6/DeclarationsPage.vue'),
        name: 'app6-declarations',
      },
      {
        path: 'app6/mandats-recette',
        component: () => import('pages/app6/MandatsRecettePage.vue'),
        name: 'app6-mandats-recette',
      },
      {
        path: 'app6/bordereaux',
        component: () => import('pages/app6/BordereauxPage.vue'),
        name: 'app6-bordereaux',
      },
      {
        path: 'app6/bordereaux-mandats-recette',
        component: () => import('pages/app6/BordereauMandatsRecettePage.vue'),
        name: 'app6-bordereaux-mandats-recette',
      },
      {
        path: 'app6/previsions',
        component: () => import('pages/app6/PrevisionRecettesPage.vue'),
        name: 'app6-previsions',
      },
      {
        path: 'app6/taxes',
        component: () => import('pages/app6/TaxesPage.vue'),
        name: 'app6-taxes',
      },
      {
        path: 'app6/statistiques',
        component: () => import('pages/app6/StatistiquesPage.vue'),
        name: 'app6-statistiques',
      },
      // Routes App7 - Gestion des Employés
      {
        path: 'app7/dashboard',
        component: () => import('pages/app7/DashboardPage.vue'),
        name: 'app7-dashboard',
      },
      {
        path: 'app7/services',
        component: () => import('pages/app7/ServicesPage.vue'),
        name: 'app7-services',
      },
      {
        path: 'app7/employes',
        component: () => import('pages/app7/EmployesPage.vue'),
        name: 'app7-employes',
      },
      {
        path: 'app7/salaires',
        component: () => import('pages/app7/SalairesPage.vue'),
        name: 'app7-salaires',
      },
      {
        path: 'app7/conges',
        component: () => import('pages/app7/CongesPage.vue'),
        name: 'app7-conges',
      },
      {
        path: 'app7/missions',
        component: () => import('pages/app7/OrdresMissionPage.vue'),
        name: 'app7-missions',
      },
      {
        path: 'app7/statistiques',
        component: () => import('pages/app7/StatistiquesPage.vue'),
        name: 'app7-statistiques',
      },
      // Compte Administratif
      {
        path: 'compte-admin',
        component: () => import('pages/compte-admin/CompteAdminPage.vue'),
        name: 'compte-admin',
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;

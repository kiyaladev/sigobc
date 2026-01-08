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
        path: 'app6/bordereaux',
        component: () => import('pages/app6/BordereauxPage.vue'),
        name: 'app6-bordereaux',
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

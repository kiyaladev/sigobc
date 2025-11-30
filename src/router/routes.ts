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
      {
        path: '',
        component: () => import('pages/app1/DashboardPage.vue'),
        name: 'dashboard',
      },
      {
        path: 'profile',
        component: () => import('pages/app1/ProfilePage.vue'),
        name: 'profile',
      },
      {
        path: 'mairies',
        component: () => import('pages/app1/MairiesPage.vue'),
        name: 'mairies',
      },
      {
        path: 'taxes',
        component: () => import('pages/app1/TaxesPage.vue'),
        name: 'taxes',
      },
      {
        path: 'declarations',
        component: () => import('pages/app1/DeclarationsPage.vue'),
        name: 'declarations',
      },
      {
        path: 'bordereaux',
        component: () => import('pages/app1/BordereauxPage.vue'),
        name: 'bordereaux',
      },
      {
        path: 'statistiques',
        component: () => import('pages/app1/StatistiquesPage.vue'),
        name: 'statistiques',
      },
      {
        path: 'utilisateurs',
        component: () => import('pages/UtilisateursPage.vue'),
        name: 'utilisateurs',
        meta: { requiresAdmin: true },
      },
      {
        path: 'admin/seeders',
        component: () => import('pages/app1/AdminSeedersPage.vue'),
        name: 'seeders',
        meta: { requiresAdmin: true },
      },
      {
        path: 'admin/backup',
        component: () => import('pages/app1/BackupPage.vue'),
        name: 'backup',
        meta: { requiresAdmin: true },
      },
      // Routes App2 - Gestion des Stocks de Tickets
      {
        path: 'app2/dashboard',
        component: () => import('pages/app2/DashboardPage.vue'),
        name: 'app2-dashboard',
      },
      {
        path: 'app2/approvisionnements',
        component: () => import('pages/app2/ApprovisionnementPage.vue'),
        name: 'app2-approvisionnements',
      },
      {
        path: 'app2/remises',
        component: () => import('pages/app2/RemisesPage.vue'),
        name: 'app2-remises',
      },
      {
        path: 'app2/versements',
        component: () => import('pages/app2/VersementsPage.vue'),
        name: 'app2-versements',
      },
      {
        path: 'app2/balance-entree',
        component: () => import('pages/app2/BalanceEntreePage.vue'),
        name: 'app2-balance-entree',
      },
      {
        path: 'app2/statistiques',
        component: () => import('pages/app2/StatistiquesPage.vue'),
        name: 'app2-statistiques',
      },
      {
        path: 'app2/sections',
        component: () => import('pages/app2/SectionPage.vue'),
        name: 'app2-sections',
      },
      {
        path: 'app2/quotites',
        component: () => import('pages/app2/QuotitesPage.vue'),
        name: 'app2-quotites',
      },
      // Routes App3 - Gestion des Dépenses
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
        path: 'app3/bordereaux-mandats',
        component: () => import('pages/app3/BordereauxMandatsPage.vue'),
        name: 'app3-bordereaux-mandats',
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

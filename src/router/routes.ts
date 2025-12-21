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
      // Routes App5 - Gestion des Investissements
      {
        path: 'app5/dashboard',
        component: () => import('pages/app5/DashboardPage.vue'),
        name: 'app5-dashboard',
      },
      {
        path: 'app5/chapitres',
        component: () => import('pages/app5/ChapitresPage.vue'),
        name: 'app5-chapitres',
      },
      {
        path: 'app5/sous-chapitres',
        component: () => import('pages/app5/SousChapitresPage.vue'),
        name: 'app5-sous-chapitres',
      },
      {
        path: 'app5/previsions',
        component: () => import('pages/app5/PrevisionPage.vue'),
        name: 'app5-previsions',
      },
      {
        path: 'app5/mandats',
        component: () => import('pages/app5/MandatsPage.vue'),
        name: 'app5-mandats',
      },
      {
        path: 'app5/bordereaux-mandats',
        component: () => import('pages/app5/BordereauxMandatsPage.vue'),
        name: 'app5-bordereaux-mandats',
      },
      {
        path: 'app5/statistiques',
        component: () => import('pages/app5/StatistiquesPage.vue'),
        name: 'app5-statistiques',
      },
      {
        path: 'app5/ct02',
        component: () => import('pages/app5/CT02Page.vue'),
        name: 'app5-ct02',
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

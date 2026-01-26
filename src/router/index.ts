import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';
import { useAuthStore } from 'src/stores/auth-store';
import { useDemoStore } from 'src/stores/demo-store';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  // Guard d'authentification
  Router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();
    const demoStore = useDemoStore();

    // Vérifier l'authentification si pas déjà fait
    if (!authStore.isAuthenticated) {
      await authStore.checkAuth();
    }

    // Si la route nécessite une authentification
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      next('/login');
      return;
    }

    // Si la route nécessite des droits admin
    if (to.meta.requiresAdmin && !authStore.isAdmin) {
      next('/');
      return;
    }

    // Restriction mode démo : bloquer l'accès aux routes admin
    if (to.meta.requiresAdmin && demoStore.isActive) {
      next('/');
      return;
    }

    // Si l'utilisateur est déjà connecté et va sur /login, rediriger vers /
    if (to.path === '/login' && authStore.isAuthenticated) {
      next('/');
      return;
    }

    next();
  });

  return Router;
});

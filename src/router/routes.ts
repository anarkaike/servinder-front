import { RouteRecordRaw } from 'vue-router';
import { requireAuth, requireGuest } from './middleware/auth'
import { handleAuthCallback } from './middleware/handleAuthCallback'

const routes: RouteRecordRaw[] = [
  {
    path: '/admin',
    component: () => import('layouts/MainLayout.vue'),
    beforeEnter: [handleAuthCallback, requireAuth],
    children: [
      { 
        path: '', 
        component: () => import('pages/IndexPage.vue') 
      }
    ],
  },
  {
    path: '/',
    component: () => import('layouts/AuthLayout.vue'),
    beforeEnter: [handleAuthCallback, requireGuest],
    children: [
      {
        path: 'login',
        component: () => import('pages/auth/LoginPage.vue')
      },
      {
        path: 'register',
        component: () => import('pages/auth/RegisterPage.vue')
      }
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;

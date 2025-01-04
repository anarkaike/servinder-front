import { RouteRecordRaw } from 'vue-router';
import { requireAuth, requireGuest } from './middleware/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    beforeEnter: requireAuth,
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
    beforeEnter: requireGuest,
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

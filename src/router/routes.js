const routes = [
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'inicio', component: () => import('../pages/IndexPage.vue') },
      { path: 'transparencia', name: 'transparencia', component: () => import('../pages/TransparencyPage.vue') },
      { path: 'contacto', name: 'contacto', component: () => import('../pages/ContactPage.vue') },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('../pages/[...path].vue'),
  },
]

export default routes
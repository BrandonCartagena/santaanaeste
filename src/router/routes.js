const routes = [
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'inicio', component: () => import('../pages/IndexPage.vue') },
      { path: 'impuestos', name: 'impuestos', component: () => import('../pages/Impuestos.vue') },
      { path: 'contacto', name: 'contacto', component: () => import('../pages/ContactPage.vue') },
      { path: 'registro_civil', name: 'registro_civil', component: () => import('../pages/registro_civil.vue')},
      { path: 'reporte_antisoborno', name: 'reporte_antisoborno', component: () => import('../pages/DenunciaSobornoPage.vue')}
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('../pages/[...path].vue'),
  },
]

export default routes
import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    // {
    //   path: '/landing-page',
    //   name: 'landing-page',
    //   component: require('@/components/LandingPage').default
    // },
    {
      path: '/',
      name: 'home',
      component: require('@/components/Home').default 
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})

import Vue from 'vue'
import VueRouter from 'vue-router'
import VueResource from 'vue-resource'
import store from './store'
import App from './App.vue'
import Home from './components/Home.vue'
import Days from './components/days/Days.vue'

Vue.use(VueResource)
Vue.use(VueRouter)

const routes = [
  { path: '/home', name: 'home', component: Home },
  { path: '/days', name: 'days', component: Days },
  { path: '*', redirect: '/home' }
]

const router = new VueRouter({
  routes // short for routes: routes
})

// Create and mount the root instance
const app = new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app')


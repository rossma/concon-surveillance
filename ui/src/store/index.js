import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions'
import * as getters from './getters'
import days from './modules/days'
// import createLogger from '../../../src/plugins/logger'

Vue.use(Vuex)

// const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  actions,
  getters,
  modules: {
    days
  }
  //,
  //strict: debug,
  // plugins: debug ? [createLogger()] : []
})

//
// Vue.use(Vuex)
//
// const state = {
//   notes: [],
//   activeNote: {},
//   order: {}
// }
//
// export default new Vuex.Store({
//   state,
//   mutations
// })
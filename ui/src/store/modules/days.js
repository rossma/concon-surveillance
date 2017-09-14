import * as types from '../mutation-types'

// initial state
const state = {
  order: {}
}

// getters
const getters = {
  order: state => state.order
}

// actions
const actions = {
  setOrder ({ commit }, order) {
    console.log("in days.actions.setOrder:" + JSON.stringify(order))
    commit(types.SET_ORDER, order)
  }

// getOrder ({ commit }) {
  //   shop.getProducts(products => {
  //     commit(types.RECEIVE_PRODUCTS, { products })
  //   })
  // }
  //
  // checkout ({ commit, state }, products) {
  //   const savedCartItems = [...state.added]
  //   commit(types.CHECKOUT_REQUEST)
  //   shop.buyProducts(
  //     products,
  //     () => commit(types.CHECKOUT_SUCCESS),
  //     () => commit(types.CHECKOUT_FAILURE, { savedCartItems })
  //   )
  // }
}

// mutations
const mutations = {
  [types.SET_ORDER] (state, order ) {
    console.log("in days.mutations.set_order:"  + JSON.stringify(order))
    state.order = order
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}

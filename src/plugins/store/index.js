import Vue from 'vue'
import Vuex from 'vuex'
import _ from 'lodash'
import moment from 'moment'
import rowsNames from '../../assets/store/rowsNames.json'
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    options:{},
    lineChart:{},
    speedMeter: {},
    copChart:{},
  },
  mutations: {},
  actions: {}
})
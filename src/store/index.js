import Vue from 'vue';
import Vuex from 'vuex';
import actions from '@/store/actions/actions';
import mutations from '@/store/mutations/mutations';
import state from '@/store/state/state';
Vue.use(Vuex);

export default new Vuex.Store({
  state: state.state,
  mutations: mutations.mutations,
  actions: actions.actions,
  modules: {}
});

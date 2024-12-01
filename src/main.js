import Vue from 'vue';
import App from './views/App.vue';
import './registerServiceWorker';
import store from './store';
import axios from 'axios';
import iView from 'iview';
import VueTools from './utils/vue/vue-tool';
import VueCookies from 'vue-cookies';
import 'iview/dist/styles/iview.css';
import bootstrap from '@/core/bootstrap';
import '@/plugin/vant/vant-ui.js';
import Device from '@/plugin/device/ua-parser-js';
import Loading from '@/plugin/vant/loading/loading.js';
import filters from '@/utils/vue/filters/common.js';

const bootstrapResult = bootstrap.bootstrap(process.env.VUE_APP_PROJECT_ID, {});
const deviceInfo = Device.device.getResult();
Vue.config.productionTip = false;
Vue.use(iView);
Vue.use(VueTools);
Vue.use(VueCookies);
Vue.use(Loading);
Vue.config.productionTip = false;
Vue.prototype.$axios = axios;
Vue.prototype.$deviceInfo = deviceInfo;
Object.keys(filters).forEach((key) => Vue.filter(key, filters[key]));
new Vue({
  router: bootstrapResult.routerInstance,
  store,
  render: (h) => h(App)
}).$mount('#app');

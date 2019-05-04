import '@babel/polyfill';
import Vue from 'vue';
import { Layout } from 'bootstrap-vue/es/components';
import VueCroppie from 'vue-croppie';
//	import moment from 'moment';
import App from '@/App.vue';
import router from '@/router';
import store from '@/store';

//	Vue.use(vueCustomElement);
Vue.use(Layout);
Vue.use(VueCroppie);
//	Object.defineProperty(Vue.prototype, '$moment', {value: moment});

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');

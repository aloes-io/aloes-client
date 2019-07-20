import Vue from 'vue';
import { Layout } from 'bootstrap-vue/es/components';
import VueCroppie from 'vue-croppie';
import { library, dom } from '@fortawesome/fontawesome-svg-core';
import {
  faBinoculars,
  faArrowsAlt,
  faArrowUp,
  faCheck,
  faChevronLeft,
  faChevronRight,
  faCircle,
  faCoffee,
  faCompress,
  faDownload,
  faEnvelopeOpen,
  faExpand,
  faHome,
  faImage,
  faInfoCircle,
  faFrown,
  faLanguage,
  faLink,
  faMapMarker,
  faPhone,
  faPlay,
  faPlus,
  faPlusCircle,
  faQuestionCircle,
  faSearch,
  faSearchPlus,
  faSignInAlt,
  faSignOutAlt,
  faSmile,
  faSpinner,
  faStar,
  faStop,
  faSync,
  faTimes,
  faToggleOn,
  faToggleOff,
  faTrash,
  faUser,
  faUserPlus,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

//  import moment from 'moment';
import App from '@/App.vue';
import router from '@/router';
import store from '@/store';

Vue.config.productionTip = false;

Vue.use(Layout);
Vue.use(VueCroppie);
//  Object.defineProperty(Vue.prototype, '$moment', {value: moment});

library.add(
  faBinoculars,
  faArrowsAlt,
  faArrowUp,
  faCheck,
  faChevronLeft,
  faChevronRight,
  faCircle,
  faCoffee,
  faCompress,
  faDownload,
  faEnvelopeOpen,
  faExpand,
  faHome,
  faImage,
  faInfoCircle,
  faFrown,
  faLanguage,
  faLink,
  faMapMarker,
  faPhone,
  faPlay,
  faPlus,
  faPlusCircle,
  faQuestionCircle,
  faSearch,
  faSearchPlus,
  faSignInAlt,
  faSignOutAlt,
  faSmile,
  faSpinner,
  faStar,
  faStop,
  faSync,
  faTimes,
  faToggleOn,
  faToggleOff,
  faTrash,
  faUser,
  faUserPlus,
);
dom.watch();
Vue.component('fa-icon', FontAwesomeIcon);

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');

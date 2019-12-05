/*  
Aloes-client is a browser interface to manipulate Aloes device-manager API/resources.

Copyright 2019 Edouard Maleix

Aloes-client is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
 any later version.

Aloes-client is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with Aloes-client.  If not, see <https://www.gnu.org/licenses/>.
*/

import Vue from 'vue';
import { LayoutPlugin } from 'bootstrap-vue';
import VueCroppie from 'vue-croppie';
import 'croppie/croppie.css';
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
import App from '@/App.vue';
import router from '@/router';
import store from '@/store';

Vue.config.productionTip = false;

Vue.use(LayoutPlugin);
Vue.use(VueCroppie);

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

import Vue from 'vue';
import Vuex from 'vuex';
import VuexPersistence from 'vuex-persist';
import vuexCache from 'vuex-cache';
import async from '@/modules/async';
import auth from '@/modules/auth';
import address from '@/modules/address';
import team from '@/modules/team';
import device from '@/modules/device';
import sensor from '@/modules/sensor';
import application from '@/modules/application';
import files from '@/modules/files';
import search from '@/modules/search';
import loopback from '@/services/loopback';
import logger from '@/services/logger';

Vue.use(Vuex);

const profileStorage = new VuexPersistence({
  key: 'profile',
  storage: window.localStorage,
  reducer: state => ({
    account: state.auth.account,
    // device: state.device,
    //  devices: state.device.collection,
    //  sensors: state.device.sensorsCollection,
    address: state.address,
  }),
  asyncStorage: false,
});

// const vuexSession = new VuexPersistence({
//   key: 'aloes-client-token',
//   storage: window.sessionStorage,
//   reducer: state => ({
//     access_token: state.auth.access_token,
//   }),
//   asyncStorage: false,
// });

export default new Vuex.Store({
  state: {
    env: `${process.env.NODE_ENV}`,
    serverUrl: `${process.env.VUE_APP_SERVER_URL}`,
    restApiRoot: `${process.env.VUE_APP_ROOT_API}`,
    clientUrl: `${process.env.VUE_APP_CLIENT_URL}`,
    fileUploadUrl: `${process.env.VUE_APP_SERVER_URL}${process.env.VUE_APP_ROOT_API}/files`,
    repoUrl: 'https://github.com/aloes-io',
    style: {
      color: {
        primary: '#000000',
        secondary: '#ededed',
        success: '#2bb673',
      },
      palette: {
        black: '#000000',
        grey: '#ededed',
        blue: '#29abe2',
        lightgreen: '#d6e6dc',
        green: '#77d1bf',
        lightblue: '#98d4ee',
        yellow: '#ffc85f',
        lightyellow: '#f6d9a2',
      },
      fonts: {
        head: `LemonMilkbold`,
        text: `'JosefinSlab-SemiBold', serif`,
      },
      pictures: {
        logo: `/icons/aloes-icon.png`,
        logoFont: `/icons/aloesfont1.png`,
        background: `/images/bg1.png`,
        notFound: `/images/404.jpg`,
        circlePlus: `/icons/circle-plus.png`,
        circleMinus: `/icons/circle-minus.png`,
        circleCross: `/icons/circle-cross.png`,
        mapMarker: `/icons/map-marker.png`,
        mapMarkerAlt: `/icons/map-marker-alt.png`,
        mapMarkerWhite: `/icons/map-marker-white.png`,
        imgPlaceholder: `/icons/image-placeholder.png`,
        signOut: `/icons/sign-out.png`,
        search: `/icons/search.png`,
        sliders: `/icons/sliders.png`,
        pencilSquare: `/icons/icon-modifier.png`,
        message: `/icons/message.png`,
        messageAlt: `/icons/message-alt.png`,
        user: `/icons/user.png`,
        device: `/icons/aloes/iot.png`,
        deviceOn: `/icons/device-on.png`,
        deviceOff: `/icons/device-off.png`,
        node: `/icons/aloes/node.png`,
        nodeOff: `/icons/aloes/node-white.png`,
        virtualObject: `/icons/aloes/virtual-object.png`,
        virtualObjectOff: `/icons/aloes/virtual-object-white.png`,
        virtualObjectAlt: `/icons/aloes/virtual-object-alt.png`,
        virtualObjectAltOff: `/icons/aloes/virtual-object-alt-white.png`,
        teamAlt: `/icons/team-alt.png`,
        team: `/icons/team-on.png`,
        teamOff: `/icons/team-off.png`,
        notification: `/icons/notification.png`,
        premium: `/icons/premium.png`,
        checkGreen: `/icons/check-green.png`,
        statusOn: `/icons/status-on.png`,
        statusOnAlt: `/icons/status-on-alt.png`,
        statusOff: `/icons/status-off.png`,
        statusOffAlt: `/icons/status-off-alt.png`,
      },
      videos: {
        createDeviceWebm: `/videos/create-device.webm`,
        createDeviceMp4: `/videos/create-device.mp4`,
        createDeviceOgv: `/videos/create-device.ogg`,
        scriptScenarioMp4: `/videos/script-scenario.mp4`,
      },
    },
    deviceTypes: [
      { text: 'type', value: null, disabled: true },
      { text: 'Audio recorder', value: 'audio-input' },
      { text: 'Audio player', value: 'audio-output' },
      { text: 'Bot', value: 'bot' },
      { text: 'Browser', value: 'browser' },
      { text: 'Camera', value: 'camera' },
      { text: 'Clock', value: 'clock' },
      { text: 'Coffee machine', value: 'coffee-machine' },
      { text: 'Door', value: 'door' },
      { text: 'Vents', value: 'fan' },
      { text: 'Gateway', value: 'gateway' },
      { text: 'Light controller', value: 'light-output' },
      { text: 'Measurement', value: 'measurement' },
      { text: 'Midi recorder', value: 'midi-input' },
      { text: 'Midi player', value: 'midi-output' },
      { text: 'Micro computer', value: 'mcu' },
      { text: 'Node', value: 'node' },
      { text: 'Phone', value: 'phone' },
      { text: 'Pump', value: 'pump' },
      { text: 'Scanner', value: 'scanner' },
      { text: 'Screen', value: 'screen' },
      { text: 'Switch input', value: 'switch-input' },
      { text: 'Switch output', value: 'switch-output' },
      { text: 'Geolocator', value: 'tracker' },
      { text: 'Vehicle', value: 'vehicle' },
      { text: 'Weather station', value: 'weather station' },
    ],
    transportProtocolNames: [
      { text: 'name', value: null, disabled: true },
      { text: 'AloesLight', value: 'aloeslight' },
      { text: 'AloesClient', value: 'aloesClient' },
      { text: 'MySensors', value: 'mySensors' },
      { text: 'LoraWan', value: 'loraWan' },
    ],
    windowWidth: 0,
    windowHeight: 0,
    contactForm: {
      firstName: null,
      lastName: null,
      email: null,
      subject: null,
      content: null,
    },
    coinHive: {
      siteKey: process.env.VUE_APP_COINHIVE_SITE_KEY,
      hashes: `${process.env.VUE_APP_COINHIVE_HASHES}` || '256',
    },
  },
  mutations: {
    setModelKV(state, { key, value }) {
      state[key] = value;
    },
    setContactFormKV(state, { key, value }) {
      state.contactForm[key] = value;
    },
    cleanContactForm(state) {
      state.contactForm = {
        firstName: null,
        lastName: null,
        email: null,
        subject: null,
        content: null,
      };
    },
  },
  actions: {
    async sendContactForm({ state }) {
      try {
        logger.publish(4, 'App', 'dispatch:sendContactForm:req', state.contactForm);
        const response = await loopback.post('users/send-contact-form', {
          form: state.contactForm,
        });
        logger.publish(3, 'App', 'dispatch:sendContactForm:res', response);
        return response;
      } catch (error) {
        logger.publish(3, 'App', 'dispatch:sendContactForm:err', error);
        throw error;
      }
    },
  },
  plugins: [
    profileStorage.plugin,
    //  deviceStorage.plugin,
    //  vuexSession.plugin,
    vuexCache({ timeout: 2000 }),
  ],
  modules: {
    async, // async namespaced
    auth, // auth namespaced
    address,
    device,
    sensor,
    application,
    team,
    files,
    search,
  },
});

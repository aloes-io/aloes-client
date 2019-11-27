/* Copyright 2019 Edouard Maleix, read LICENSE */

import Vue from 'vue';
import Vuex from 'vuex';
import VuexPersistence from 'vuex-persist';
import vuexCache from 'vuex-cache';
import async from '@/store/async';
import auth from '@/store/auth';
import address from '@/store/address';
import team from '@/store/team';
import device from '@/store/device';
import sensor from '@/store/sensor';
import application from '@/store/application';
import files from '@/store/files';
import search from '@/store/search';
import loopback from '@/services/loopback';
import logger from '@/services/logger';

Vue.use(Vuex);

const profileStorage = new VuexPersistence({
  key: 'profile',
  storage: window.localStorage,
  reducer: state => ({
    account: state.auth.account,
    address: state.address.profileAddress,
  }),
});

const deviceStorage = new VuexPersistence({
  key: 'devices',
  storage: window.localStorage,
  reducer: state => ({
    collection: state.device.collection,
  }),
  filter: mutation => mutation.type === 'setStateKV',
  asyncStorage: false,
});

export default new Vuex.Store({
  state: {
    env: `${process.env.NODE_ENV}`,
    serverUrl: `${process.env.VUE_APP_SERVER_URL}`,
    restApiRoot: `${process.env.VUE_APP_ROOT_API}`,
    clientUrl: `${process.env.VUE_APP_CLIENT_URL}`,
    repoUrl: 'https://github.com/aloes-io',
    repoUrl2: 'https://github.com/getlarge',
    deviceNetwork: require('@/assets/data/device-tree.json'),
    // deviceNetwork: '@/assets/data/device-tree.json',
    virtualObject: require('@/assets/data/virtual-object-composition.json'),
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
        logo: require('@/assets/img/aloes-icon.png'),
        notFound: require('@/assets/img/404.jpg'),
        mapMarker: require('@/assets/img/map-marker.png'),
        mapMarkerAlt: require('@/assets/img/map-marker-alt.png'),
        mapMarkerWhite: require('@/assets/img/map-marker-alt.png'),
        imgPlaceholder: require('@/assets/img/image-placeholder.png'),
        headerPlaceholder: require('@/assets/img/header-placeholder.png'),
        pencilSquare: require('@/assets/img/icon-modifier.png'),
        application: require('@/assets/img/iot.png'),
        deviceOn: require('@/assets/img/device-on.png'),
        deviceOff: require('@/assets/img/device-off.png'),
        device: require('@/assets/img/node.png'),
        deviceAlt: require('@/assets/img/node-white.png'),
        virtualObject: require('@/assets/img/virtual-object.png'),
        virtualObjectOff: require('@/assets/img/virtual-object-white.png'),
        virtualObjectAlt: require('@/assets/img/virtual-object-alt.png'),
        virtualObjectAltOff: require('@/assets/img/virtual-object-alt-white.png'),
        team: require('@/assets/img/team-on.png'),
        teamOff: require('@/assets/img/team-off.png'),
        user: require('@/assets/img/user.png'),
        notification: require('@/assets/img/notification.png'),
      },
      videos: {
        createDeviceMp4: require('@/assets/videos/create-device.mp4'),
        // createDeviceWebm: `/videos/create-device.webm`,
        // createDeviceOgv: `/videos/create-device.ogg`,
        scriptScenarioMp4: require('@/assets/videos/script-scenario.mp4'),
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
      { text: 'Timer', value: 'timer' },
      { text: 'Geolocator', value: 'tracker' },
      { text: 'Vehicle', value: 'vehicle' },
      { text: 'Weather station', value: 'weather-station' },
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
        const response = await loopback.post('Users/send-contact-form', {
          form: state.contactForm,
        });
        logger.publish(3, 'App', 'dispatch:sendContactForm:res', response);
        return response;
      } catch (error) {
        logger.publish(2, 'App', 'dispatch:sendContactForm:err', error);
        throw error;
      }
    },
  },
  plugins: [profileStorage.plugin, deviceStorage.plugin, vuexCache({ timeout: 3000 })],
  modules: {
    async,
    auth,
    address,
    device,
    sensor,
    application,
    team,
    files,
    search,
  },
});

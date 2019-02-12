import Vue from "vue";
import Vuex from "vuex";
import VuexPersistence from "vuex-persist";
import vuexCache from "vuex-cache";
import async from "@/modules/async";
import auth from "@/modules/auth";
import address from "@/modules/address";
import team from "@/modules/team";
import device from "@/modules/device";
import files from "@/modules/files";
import time from "@/modules/time";
import search from "@/modules/search";
import virtualObject from "@/modules/virtualObject";
//  import notification from "@/modules/notification";
//  import scheduler from "@/modules/scheduler";
import loopback from "@/services/loopback";
import logger from "@/services/logger";

Vue.use(Vuex);

const vuexLocal = new VuexPersistence({
  key: "profile",
  storage: window.localStorage,
  reducer: state => ({
    account: state.auth.account,
    address: state.address
  }),
  asyncStorage: false
});

// const vuexSession = new VuexPersistence({
//   key: "nav",
//   storage: window.sessionStorage,
//   reducer: (state) => ({
//     files: state.files,
//     search: state.search,
//   }),
//   asyncStorage: false,
// });

export default new Vuex.Store({
  state: {
    env: `${process.env.NODE_ENV}`,
    serverUrl: `${process.env.VUE_APP_SERVER_URL}`,
    resApiRoot: `${process.env.VUE_APP_ROOT_API}`,
    clientUrl: `${process.env.VUE_APP_CLIENT_URL}`,
    fileUploadUrl: `${process.env.VUE_APP_SERVER_URL}${
      process.env.VUE_APP_ROOT_API
    }/files`,
    repoUrl: "https://framagit.org/aloes",
    style: {
      color: {
        primary: "#000000",
        secondary: "#ededed",
        success: "#2bb673"
      },
      palette: {
        black: "#000000",
        grey: "#ededed",
        green: "#77d1bf",
        blue: "#29abe2",
        yellow: "#ffc85f"
      },
      pictures: {
        logo: `${process.env.VUE_APP_CLIENT_URL}/icons/aloesicon2.png`,
        logoFont: `${process.env.VUE_APP_CLIENT_URL}/icons/aloesfont1.png`,
        background: `${process.env.VUE_APP_CLIENT_URL}/images/bg1.png`,
        notFound: `${process.env.VUE_APP_CLIENT_URL}/images/404.jpg`,
        circlePlus: `${process.env.VUE_APP_CLIENT_URL}/icons/circle-plus.png`,
        circleMinus: `${process.env.VUE_APP_CLIENT_URL}/icons/circle-minus.png`,
        circleCross: `${process.env.VUE_APP_CLIENT_URL}/icons/circle-cross.png`,
        mapMarker: `${process.env.VUE_APP_CLIENT_URL}/icons/map-marker.png`,
        mapMarkerAlt: `${
          process.env.VUE_APP_CLIENT_URL
        }/icons/map-marker-alt.png`,
        mapMarkerWhite: `${
          process.env.VUE_APP_CLIENT_URL
        }/icons/map-marker-white.png`,
        imgPlaceholder: `${
          process.env.VUE_APP_CLIENT_URL
        }/icons/image-placeholder.png`,
        signOut: `${process.env.VUE_APP_CLIENT_URL}/icons/sign-out.png`,
        search: `${process.env.VUE_APP_CLIENT_URL}/icons/search.png`,
        sliders: `${process.env.VUE_APP_CLIENT_URL}/icons/sliders.png`,
        pencilSquare: `${
          process.env.VUE_APP_CLIENT_URL
        }/icons/icon-modifier.png`,
        message: `${process.env.VUE_APP_CLIENT_URL}/icons/message.png`,
        messageAlt: `${process.env.VUE_APP_CLIENT_URL}/icons/message-alt.png`,
        user: `${process.env.VUE_APP_CLIENT_URL}/icons/user.png`,
        device: `${process.env.VUE_APP_CLIENT_URL}/icons/aloes/iot.png`,
        deviceOn: `${process.env.VUE_APP_CLIENT_URL}/icons/device-on.png`,
        deviceOff: `${process.env.VUE_APP_CLIENT_URL}/icons/device-off.png`,
        // deviceOff: `${
        //   process.env.VUE_APP_CLIENT_URL
        // }/icons/aloes/iot-white.png`,
        node: `${process.env.VUE_APP_CLIENT_URL}/icons/aloes/node.png`,
        nodeOff: `${process.env.VUE_APP_CLIENT_URL}/icons/aloes/node-white.png`,
        virtualObject: `${
          process.env.VUE_APP_CLIENT_URL
        }/icons/aloes/virtual-object.png`,
        virtualObjectOff: `${
          process.env.VUE_APP_CLIENT_URL
        }/icons/aloes/virtual-object-white.png`,
        virtualObjectAlt: `${
          process.env.VUE_APP_CLIENT_URL
        }/icons/aloes/virtual-object-alt.png`,
        virtualObjectAltOff: `${
          process.env.VUE_APP_CLIENT_URL
        }/icons/aloes/virtual-object-alt-white.png`,
        teamAlt: `${process.env.VUE_APP_CLIENT_URL}/icons/team-alt.png`,
        team: `${process.env.VUE_APP_CLIENT_URL}/icons/team-on.png`,
        teamOff: `${process.env.VUE_APP_CLIENT_URL}/icons/team-off.png`,
        notification: `${
          process.env.VUE_APP_CLIENT_URL
        }/icons/notification.png`,
        premium: `${process.env.VUE_APP_CLIENT_URL}/icons/premium.png`,
        checkGreen: `${process.env.VUE_APP_CLIENT_URL}/icons/check-green.png`,
        statusOn: `${process.env.VUE_APP_CLIENT_URL}/icons/status-on.png`,
        statusOnAlt: `${
          process.env.VUE_APP_CLIENT_URL
        }/icons/status-on-alt.png`,
        statusOff: `${process.env.VUE_APP_CLIENT_URL}/icons/status-off.png`,
        statusOffAlt: `${
          process.env.VUE_APP_CLIENT_URL
        }/icons/status-off-alt.png`
      },
      videos: {
        createDeviceWebm: `${
          process.env.VUE_APP_CLIENT_URL
        }/videos/create-device.webm`,
        createDeviceMp4: `${
          process.env.VUE_APP_CLIENT_URL
        }/videos/create-device.mp4`,
        createDeviceOgv: `${
          process.env.VUE_APP_CLIENT_URL
        }/videos/create-device.ogg`
      }
    },
    deviceTypes: [
      { text: "type", value: null, disabled: true },
      { text: "Gateway", value: "gateway" },
      { text: "Node", value: "node" },
      { text: "Phone", value: "phone" },
      { text: "Camera", value: "camera" }
      // {text: "Bot", value: "bot"},
      // {text: "Browser", value: "browser"},
    ],
    protocolNames: [
      { text: "name", value: null, disabled: true },
      { text: "NodeWebcam", value: "nodeWebcam" },
      { text: "Aloes", value: "aloes" },
      { text: "AloesClient", value: "aloesClient" },
      { text: "MySensors", value: "mySensors" }
    ],
    virtualObjectTypes: [
      { text: "type", value: null, disabled: true },
      { text: "Gateway", value: "gateway" },
      { text: "Node", value: "node" },
      { text: "Phone", value: "phone" },
      { text: "Camera", value: "camera" },
      { text: "Thermostat", value: "thermostat" }
      // {text: "Bot", value: "bot"},
    ],
    schedulerTypes: [
      {
        value: null,
        text: "Scheduler type",
        disabled: true
      },
      {
        value: "watcher",
        text: "Watcher"
      },
      {
        value: "trigger",
        text: "trigger"
      }
    ],
    appointmentsStyles: {
      watcher: { title: "watcher", color: "#528fa2" },
      trigger: { title: "trigger", color: "#7ebcaf" },
      default: { title: "", color: "#5478c0" }
    },
    windowWidth: 0,
    windowHeight: 0,
    contactForm: {
      firstName: null,
      lastName: null,
      email: null,
      subject: null,
      content: null
    },
    coinHive: {
      siteKey: process.env.VUE_APP_COINHIVE_SITE_KEY,
      hashes: `${process.env.VUE_APP_COINHIVE_HASHES}` || "256"
    },
    stripe: {
      key: process.env.VUE_APP_STRIPE_PUB_KEY,
      locale: `${process.env.VUE_APP_STRIPE_LOCALE}`,
      currency: `${process.env.VUE_APP_STRIPE_CURRENCY}`,
      zipCode: `${process.env.VUE_APP_STRIPE_ZIPCODE}`
    }
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
        content: null
      };
    }
  },
  actions: {
    async sendContactForm({ state }) {
      try {
        logger.publish(
          4,
          "App",
          "dispatch:sendContactForm:req",
          state.contactForm
        );
        const response = await loopback.post("Accounts/send-contact-form", {
          form: state.contactForm
        });
        logger.publish(3, "App", "dispatch:sendContactForm:res", response);
        return response;
      } catch (error) {
        logger.publish(3, "App", "dispatch:sendContactForm:err", error);
        throw error;
      }
    }
  },
  //  plugins: [vuexLocal.plugin, vuexSession.plugin, vuexCache({timeout: 2000})],
  plugins: [vuexLocal.plugin, vuexCache({ timeout: 2000 })],
  modules: {
    async, // async namespaced
    auth, // auth namespaced
    address,
    device,
    team,
    files,
    time,
    search,
    virtualObject
    //  scheduler,
    //  notification,
  }
});

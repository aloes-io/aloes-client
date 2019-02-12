import * as actions from "./actions";
import * as mutations from "./mutations";

export default {
  namespaced: true,
  state: {
    collectionName: "Device",
    resources: "Devices",
    editorMode: false,
    success: null,
    error: null,
    dismissSecs: 5,
    dismissCountDown: 0,
    loading: null,
    collection: [],
    instance: {
      accountId: null,
      devEui: null,
      appKey: null,
      name: null,
      type: null,
      accessPointUrl: null,
      protocolName: null,
      protocolVersion: null,
      status: false,
      description: "",
      qrCode: "",
      icons: [],
      frameCounter: 0
    },
    sensors: []
  },
  mutations,
  actions
};

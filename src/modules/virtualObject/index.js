import * as actions from "./actions";
import * as mutations from "./mutations";

export default {
  namespaced: true,
  state: {
    collectionName: "VirtualObject",
    resources: "VirtualObjects",
    editorMode: false,
    success: null,
    error: null,
    dismissSecs: 5,
    dismissCountDown: 0,
    loading: null,
    collection: [],
    instance: {
      accountId: null,
      appKey: null,
      name: null,
      type: null,
      accessPointUrl: null,
      status: false,
      description: "",
      qrCode: "",
      icons: [],
      lastSignal: 0
    },
    sensors: []
  },
  mutations,
  actions
};

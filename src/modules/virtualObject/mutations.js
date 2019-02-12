import logger from "@/services/logger";

export function setModelKV(state, { key, value }) {
  state.instance[key] = value;
  // logger.publish(
  //   4,
  //   state.collectionName,
  //   "commit:setModelKV:res",
  //   state.instance[key]
  // );
}

export function setModel(state, device) {
  state.instance = device;
  logger.publish(
    4,
    state.collectionName,
    "commit:setModel:res",
    state.instance
  );
}

export function setCollection(state, devices) {
  state.collection = devices;
  // logger.publish(
  //   4,
  //   state.collectionName,
  //   "commit:setCollection:res",
  //   state.collection
  // );
}

export function setStateKV(state, { key, value }) {
  state[key] = value;
  logger.publish(4, state.collectionName, "commit:setStateKV:res", state[key]);
}

export function setEditorMode(state, value) {
  state.editorMode = value;
  logger.publish(
    4,
    state.collectionName,
    "commit:setEditorMode:res",
    state.editorMode
  );
}

export function cleanModel(state) {
  state.instance = {
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
  };
  logger.publish(
    4,
    state.collectionName,
    "commit:cleanModel:res",
    state.instance
  );
}

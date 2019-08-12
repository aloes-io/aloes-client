import logger from '@/services/logger';

export function setModelKV(state, { key, value }) {
  state.instance[key] = value;
  // logger.publish(
  //   4,
  //   state.collectionName,
  //   "commit:setModelKV:res",
  //   state.instance[key]
  // );
}

export function setModel(state, sensor) {
  state.instance = sensor;
  //  logger.publish(4, state.collectionName, 'commit:setModel:res', state.instance);
}

export function setStateKV(state, { key, value }) {
  state[key] = value;
  //  logger.publish(4, state.collectionName, 'commit:setStateKV:res', state[key]);
}

export function cleanModel(state) {
  state.instance = {
    devAddr: null,
    devEui: null,
    deviceId: null,
    frameCounter: 0,
    icons: [],
    messageProtocol: null,
    messageProtocolVersion: null,
    name: null,
    nativeNodeId: null,
    nativeSensorId: null,
    ownerId: null,
    resource: null,
    resources: {},
    transportProtocol: null,
    transportProtocolVersion: null,
    type: 0,
    value: null,
  };
  state.sensors = [];
  logger.publish(4, state.collectionName, 'commit:cleanModel:res', state.instance);
}

import * as actions from './actions';
import * as mutations from './mutations';

export default {
  namespaced: true,
  state: {
    collectionName: 'Sensor',
    resources: 'Sensors',
    success: null,
    error: null,
    dismissSecs: 5,
    dismissCountDown: 0,
    loading: null,
    outputTopic: 'IoTAgent',
    collection: [],
    instance: {
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
    },
  },
  mutations,
  actions,
};

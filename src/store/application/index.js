/* Copyright 2019 Edouard Maleix, read LICENSE */

import * as actions from './actions';
import * as mutations from './mutations';

export default {
  namespaced: true,
  state: {
    collectionName: 'Application',
    resources: 'Applications',
    editorMode: false,
    success: null,
    error: null,
    dismissSecs: 5,
    dismissCountDown: 0,
    loading: null,
    collection: [],
    instance: {
      userId: null,
      name: null,
      icon: '/icons/image-placeholder.png',
      description: null,
      accessPointUrl: null,
      transportProtocol: null,
      transportProtocolVersion: null,
      appEui: null,
      apiKey: null,
      pattern: null,
      validators: {},
      public: false,
    },
  },
  mutations,
  actions,
};

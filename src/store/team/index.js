/* Copyright 2019 Edouard Maleix, read LICENSE */

import * as actions from './actions';
import * as mutations from './mutations';

export default {
  namespaced: true,
  state: {
    collectionName: 'Team',
    resources: 'Teams',
    collection: [],
  },
  actions,
  mutations,
};

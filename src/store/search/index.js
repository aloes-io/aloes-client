/* Copyright 2019 Edouard Maleix, read LICENSE */

import * as actions from './actions';
import * as mutations from './mutations';

export default {
  namespaced: true,
  state: {
    collectionName: 'Search',
    resources: 'Searches',
    filter: null,
    model: {
      location: null,
      type: null,
      statusFilter: false,
      deviceSelected: null,
      results: [],
      success: null,
      error: null,
    },
  },
  mutations,
  actions,
};

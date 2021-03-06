/* Copyright 2020 Edouard Maleix, read LICENSE */

import * as actions from './actions';
import * as mutations from './mutations';

export default {
  namespaced: true,
  state: {
    collectionName: 'user',
    resources: 'Users',
    authRoute: 'auth',
    // eslint-disable-next-line camelcase
    access_token: null,
    account: null,
    accountModel: {
      firstName: '',
      lastName: '',
      fullName: '',
      fullAddress: null,
      status: false,
      description: '',
      headerImgUrl: '',
      avatarImgUrl: '',
    },
    viewed: {
      firstName: '',
      lastName: '',
      fullName: '',
      fullAddress: null,
      status: false,
      description: '',
      headerImgUrl: '',
      avatarImgUrl: '',
    },
    accountType: null,
    signup: {
      accountType: null,
      firstName: '',
      lastName: '',
      fullName: '',
      password: '',
      confirmPassword: '',
      checked: [],
      verified: false,
      signedUp: false,
      show: true,
      error: null,
      loading: false,
    },
    login: {
      email: null,
      password: '',
      save: true,
      dismissSecs: 4,
      dismissCountDown: 0,
      error: null,
      loading: false,
    },
    editorMode: null,
    isViewer: null,
    forgotPassword: {
      error: null,
      success: null,
      email: null,
      loading: false,
    },
  },
  actions,
  mutations,
};

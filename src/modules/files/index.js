import * as actions from './actions';
import * as mutations from './mutations';

export default {
  namespaced: true,
  state: {
    collectionName: 'files',
    resources: 'Files',
    counter: 0,
    headers: {},
    STATUS_INITIAL: 0,
    STATUS_SAVING: 1,
    STATUS_SUCCESS: 2,
    STATUS_FAILED: 3,
    Audios: {
      name: '',
      file: [],
      url: [],
      status: 0,
    },
    Binaries: {
      Firmware: {
        name: '',
        file: [],
        url: [],
        status: 0,
      },
    },
    Document: {
      attachment: {
        name: '',
        file: [],
        url: [],
        status: 0,
      },
    },
    Images: {
      Header: {
        name: '',
        file: [],
        url: '',
        status: 0,
      },
      Avatar: {
        name: '',
        file: [],
        url: '',
        status: 0,
      },
    },
  },
  mutations,
  actions,
};

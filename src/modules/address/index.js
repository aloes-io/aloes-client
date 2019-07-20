import * as actions from './actions';
import * as mutations from './mutations';

export default {
  namespaced: true,
  state: {
    collectionName: 'Address',
    resources: 'Addresses',
    editorMode: false,
    profileAddress: {
      street: '',
      streetNumber: null,
      streetName: '',
      postalCode: '',
      city: '',
      countryCode: '',
      coordinates: { lat: null, lng: null },
      verified: false,
      public: false,
      ownerId: null,
    },
    viewedProfileAddress: {
      street: '',
      streetNumber: null,
      streetName: '',
      postalCode: '',
      city: '',
      countryCode: '',
      coordinates: { lat: null, lng: null },
      verified: false,
      public: false,
    },
    deviceAddress: {
      street: null,
      streetNumber: null,
      streetName: '',
      postalCode: null,
      city: null,
      countryCode: '',
      coordinates: { lat: null, lng: null },
      verified: false,
      public: true,
      ownerId: null,
    },
  },
  mutations,
  actions,
};

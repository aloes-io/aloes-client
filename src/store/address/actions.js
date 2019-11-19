/* Copyright 2019 Edouard Maleix, read LICENSE */

import loopback from '@/services/loopback';
import logger from '@/services/logger';

const deviceApiUrl = 'Devices';
const userApiUrl = 'Users';

export async function findAddress({ state, commit }, { ownerType, ownerId, viewer }) {
  try {
    if (ownerType.toLowerCase() === 'device') {
      const address = await loopback.get(`/${deviceApiUrl}/${ownerId}/address`);
      commit('setDeviceAddress', address);
      logger.publish(3, state.collectionName, 'dispatch:findAddress:res', address);
      return address;
    } else if (ownerType.toLowerCase() === 'user') {
      const address = await loopback.get(`/${userApiUrl}/${ownerId}/address`);
      logger.publish(3, state.collectionName, 'dispatch:findAddress:res', address);
      commit('setProfileAddress', { viewer, address });
      return address;
    }
    throw new Error('Wrong ownerType');
  } catch (error) {
    logger.publish(3, state.collectionName, 'dispatch:findAddress:err', error);
    throw error;
  }
}

export async function verifyAddress({ state, commit }, ownerType) {
  try {
    let newAddress;
    logger.publish(4, state.collectionName, 'dispatch:verifyAddress:req', ownerType);

    if (ownerType.toLowerCase() === 'device') {
      newAddress = {
        street: state.deviceAddress.street,
        postalCode: state.deviceAddress.postalCode,
        city: state.deviceAddress.city,
        public: state.deviceAddress.public,
      };
    } else if (ownerType.toLowerCase() === 'user') {
      newAddress = {
        street: state.profileAddress.street,
        postalCode: state.profileAddress.postalCode,
        city: state.profileAddress.city,
        public: state.profileAddress.public,
      };
    } else {
      throw new Error('Wrong ownerType');
    }
    const address = await loopback.post(`/Addresses/verify`, { address: newAddress });

    logger.publish(4, state.collectionName, 'dispatch:verifyAddress:res', address);
    if (ownerType.toLowerCase() === 'device') {
      commit('setDeviceAddress', address);
    } else {
      commit('setProfileAddress', { viewer: false, address });
    }
    commit('setModelKV', { ownerType, key: 'verified', value: true });
    return address;
  } catch (error) {
    logger.publish(3, state.collectionName, 'dispatch:verifyAddress:err', error);
    throw error;
  }
}

// export async function saveInstance({ dispatch }, { device }) {
//   if (device.id) {
//     return dispatch('updateInstance', { device });
//   }
//   return dispatch('createInstance', { device });
// }

export async function updateAddress({ state, commit }, { ownerType, ownerId }) {
  try {
    if (ownerType.toLowerCase() === 'device') {
      state.deviceAddress.ownerId = ownerId;
      delete state.deviceAddress.id;
      const address = await loopback.put(
        `/${deviceApiUrl}/${ownerId}/address`,
        state.deviceAddress,
      );
      commit('setDeviceAddress', address);
      logger.publish(3, state.collectionName, 'dispatch:updateDeviceAddress:res', address);
      return address;
    } else if (ownerType.toLowerCase() === 'user') {
      state.profileAddress.ownerId = ownerId;
      delete state.profileAddress.id;
      const address = await loopback.put(`/${userApiUrl}/${ownerId}/address`, state.profileAddress);
      commit('setProfileAddress', { viewer: false, address });
      logger.publish(3, state.collectionName, 'dispatch:updateProfileAddress:res', address);
      return address;
    }
    throw new Error('Wrong ownerType');
  } catch (error) {
    logger.publish(3, state.collectionName, 'dispatch:updateAddress:err', error);
    throw error;
  }
}

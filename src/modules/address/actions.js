import loopback from '@/services/loopback';
import logger from '@/services/logger';

const userResources = 'users';

export async function findAddress({ state, commit }, { ownerType, ownerId, viewer }) {
  try {
    if (ownerType === 'Devices') {
      const address = await loopback.get(`/${ownerType}/${ownerId}/address`);
      commit('setDeviceAddress', address);
      logger.publish(3, state.collectionName, 'dispatch:findAddress:res', address);
      return address;
    } else if (ownerType === 'users') {
      const address = await loopback.get(`/${ownerType}/${ownerId}/address`);
      logger.publish(3, state.collectionName, 'dispatch:findAddress:res', address);
      commit('setProfileAddress', { viewer, address });
      return address;
    }
    throw new Error('Wrong ownerType');
  } catch (error) {
    return error;
  }
}

export async function verifyAddress({ state, commit }, ownerType) {
  try {
    let newAddress;
    if (ownerType === 'Devices') {
      newAddress = {
        street: state.deviceAddress.street,
        postalCode: state.deviceAddress.postalCode,
        city: state.deviceAddress.city,
        public: state.deviceAddress.public,
      };
    } else if (ownerType === 'users') {
      newAddress = {
        street: state.profileAddress.street,
        postalCode: state.profileAddress.postalCode,
        city: state.profileAddress.city,
        public: state.profileAddress.public,
      };
    } else {
      throw new Error('Wrong ownerType');
    }
    const address = await loopback
      .post(`/${userResources}/verify-address`, { address: newAddress })
      .then(res => res.updatedAddress);

    if (address.message) {
      return address;
    }
    logger.publish(4, state.collectionName, 'dispatch:verifyAddress:res', address);
    if (ownerType === 'Devices') {
      await commit('setDeviceAddress', address);
    } else {
      await commit('setProfileAddress', { viewer: false, address });
    }
    await commit('setModelKV', { ownerType, key: 'verified', value: true });
    return address;
  } catch (error) {
    return error;
  }
}

export async function updateAddress({ state, commit }, { ownerType, ownerId }) {
  try {
    if (ownerType === 'Devices') {
      state.deviceAddress.ownerId = ownerId;
      delete state.deviceAddress.id;
      const address = await loopback.put(`/${ownerType}/${ownerId}/address`, state.deviceAddress);
      commit('setDeviceAddress', address);
      logger.publish(3, state.collectionName, 'dispatch:updateDeviceAddress:res', address);
      return address;
    } else if (ownerType === 'users') {
      state.profileAddress.ownerId = ownerId;
      delete state.profileAddress.id;
      const address = await loopback.put(`/${ownerType}/${ownerId}/address`, state.profileAddress);
      commit('setProfileAddress', { viewer: false, address });
      logger.publish(3, state.collectionName, 'dispatch:updateProfileAddress:res', address);
      return address;
    }
    throw new Error('Wrong ownerType');
  } catch (error) {
    return error;
  }
}

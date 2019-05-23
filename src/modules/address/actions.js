import loopback from '@/services/loopback';
import logger from '@/services/logger';

const userResources = 'users';

export async function findAddress({ state, commit }, { route, ownerId, viewer }) {
  if (route === 'device') {
    return loopback
      .get(`/Devices/${ownerId}/deviceAddress`)
      .then(address => {
        commit('setDeviceAddress', address);
        logger.publish(3, state.collectionName, 'dispatch:findAddress:res', address);
        return address;
      })
      .catch(err => err);
  } else if (route === 'account' || route === 'profile') {
    return (
      loopback
        .get(`/${userResources}/${ownerId}/profileAddress`)
        //  .get(`/${userResources}/${ownerId}/address`)
        .then(address => {
          logger.publish(3, state.collectionName, 'dispatch:findAddress:res', address);
          commit('setProfileAddress', { viewer, address });
          return address;
        })
        .catch(err => err)
    );
  }
  return null;
}

export async function verifyAddress({ state, commit }, route) {
  try {
    let newAddress;
    if (route === 'device') {
      newAddress = {
        street: state.deviceAddress.street,
        postalCode: state.deviceAddress.postalCode,
        city: state.deviceAddress.city,
        public: state.deviceAddress.public,
      };
    } else if (route === 'account' || route === 'profile') {
      newAddress = {
        street: state.profileAddress.street,
        postalCode: state.profileAddress.postalCode,
        city: state.profileAddress.city,
        public: state.profileAddress.public,
      };
    } else {
      throw new Error('Wrong route');
    }
    const address = await loopback
      .post(`/${userResources}/verify-address`, { address: newAddress })
      .then(res => res.updatedAddress)
      .catch(err => err);

    if (address.message) {
      return address;
    }
    logger.publish(4, state.collectionName, 'dispatch:verifyAddress:res', address);
    if (route === 'device') {
      await commit('setDeviceAddress', address);
    } else {
      await commit('setProfileAddress', { viewer: false, address });
    }
    await commit('setModelKV', { route, key: 'verified', value: true });
    return address;
  } catch (error) {
    return error;
  }
}

export async function updateAddress({ state, commit }, { route, ownerId }) {
  // todo update device or profile address
  if (route === 'device') {
    return loopback
      .put(`/Devices/${ownerId}/deviceAddress`, state.deviceAddress)
      .then(address => {
        commit('setDeviceAddress', address);
        logger.publish(3, state.collectionName, 'dispatch:updateAddress:res', address);
        return address;
      })
      .catch(err => err);
  } else if (route === 'account' || route === 'profile') {
    return loopback
      .put(`/${userResources}/${ownerId}/profileAddress`, state.profileAddress)
      .then(address => {
        commit('setProfileAddress', { viewer: false, address });
        logger.publish(3, state.collectionName, 'dispatch:updateAddress:res', address);
        return address;
      })
      .catch(err => err);
  }
  return null;
}

import loopback from '@/services/loopback';
import socket from '@/services/socket';
import PubSub from '@/services/PubSub';
import logger from '@/services/logger';

export async function findByAccount({ state, commit }, ownerId) {
  try {
    const devices = await loopback.find(`/${state.resources}`, {
      where: { ownerId },
      include: ['sensors', 'address'],
      limit: 100,
    });

    let collection = JSON.parse(JSON.stringify(devices));
    collection = collection.map(device => {
      if (device.sensors) {
        delete device.sensors;
      }
      return device;
    });
    //  logger.publish(3, state.collectionName, 'dispatch:findDevicesByAccount:res', collection);
    commit('setStateKV', { key: 'collection', value: collection });
    return devices;
  } catch (error) {
    throw error;
  }
}

export async function findDeviceKV({ state, commit }, { key, value }) {
  // define limit base on acccount type ?
  try {
    const devices = await loopback.find(`/${state.resources}`, {
      where: { [key]: value },
      include: 'sensors',
      limit: 100,
    });
    return devices;
  } catch (error) {
    commit('setStateKV', { key: 'error', value: error });
    logger.publish(2, state.collectionName, 'dispatch:findDeviceKV:err', error);
    throw error;
  }
}

export async function saveInstance({ dispatch }, { device }) {
  if (device.id) {
    return dispatch('updateInstance', { device });
  }
  return dispatch('createInstance', { device });
}

export async function createInstance({ state, commit }, { device }) {
  try {
    const createdDevice = await loopback.post(`/${state.resources}`, device);
    //.post(`/${userResources}/${device.ownerId}/${state.resources.toLowerCase()}`, device)
    commit('setModel', createdDevice);
    commit('setStateKV', {
      key: 'success',
      value: { message: 'device created' },
    });
    return createdDevice;
  } catch (error) {
    commit('setStateKV', { key: 'error', value: error });
    throw error;
  }
}

export async function updateInstance({ state, commit }, { device }) {
  try {
    const deviceId = device.id;
    delete device.id;
    const updatedDevice = await loopback.put(`/${state.resources}/${deviceId}`, device);
    commit('setModel', updatedDevice);
    commit('setStateKV', {
      key: 'success',
      value: { message: 'device updated' },
    });
    return updatedDevice;
  } catch (error) {
    await commit('setStateKV', { key: 'error', value: error });
    throw error;
  }
}

export async function deleteInstance({ state, commit }, { device }) {
  try {
    const deletedDevice = await loopback.delete(`/${state.resources}/${device.id}`);
    commit('setStateKV', {
      key: 'success',
      value: { message: 'device removed' },
    });
    return deletedDevice;
  } catch (error) {
    commit('setStateKV', { key: 'error', value: error });
    throw error;
  }
}

export async function refreshToken({ state, commit }, device) {
  return loopback
    .post(`/${state.resources}/refresh-token`, { device })
    .then(res => {
      logger.publish(4, state.collectionName, 'dispatch:refreshToken:res', res);
      commit('setModel', res);
      return res;
    })
    .catch(err => err);
  //  return result;
}

export async function subscribeToDevicesUpdate({ state }, { userId }) {
  return state.collection.map(async device =>
    PubSub.subscribeToInstanceUpdate(socket.client, 'Device', userId, device.id),
  );
}

export async function unsubscribeFromDevicesUpdate({ state }, { ownerId }) {
  return state.collection.map(async device =>
    PubSub.unSubscribeWhere(socket.client, {
      collection: 'Device',
      userId: ownerId,
      method: 'PUT',
      modelId: device.id,
    }),
  );
}

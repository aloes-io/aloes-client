/* Copyright 2020 Edouard Maleix, read LICENSE */

import loopback from '@/services/loopback';
import socket from '@/services/socket';
import PubSub from '@/services/PubSub';
import logger from '@/services/logger';

export async function findByAccount({ state, commit }, { ownerId, filter }) {
  try {
    let devices = await loopback.find(`/${state.resources}`, {
      where: { ownerId },
      include: filter.include || ['address'],
      limit: filter.limit || 50,
      skip: filter.skip || 0,
    });
    logger.publish(4, state.collectionName, 'dispatch:findByAccount:req', filter);
    if (!devices || devices === null) devices = [];
    // else devices = JSON.parse(JSON.stringify(devices));
    logger.publish(3, state.collectionName, 'dispatch:findByAccount:res', devices.length);
    return devices;
  } catch (error) {
    commit('setStateKV', { key: 'error', value: error });
    throw error;
  }
}

export async function countByAccount({ state, commit }, { ownerId }) {
  const res = await loopback.find(`/${state.resources}/count`, {
    where: { ownerId },
  });
  const count = res.count || 0;
  logger.publish(3, state.collectionName, 'dispatch:countByAccount:res', count);
  commit('setStateKV', { key: 'collectionCount', value: count });
  return count;
}

export async function findDeviceKV({ state, commit }, { key, value }) {
  try {
    const devices = await loopback.find(`/${state.resources}`, {
      where: { [key]: value },
      include: 'sensors',
      limit: 100,
    });
    // if (!devices || devices === null) devices = [];
    // else devices = JSON.parse(JSON.stringify(devices));
    return devices;
  } catch (error) {
    commit('setStateKV', { key: 'error', value: error });
    logger.publish(2, state.collectionName, 'dispatch:findDeviceKV:err', error);
    throw error;
  }
}

export async function saveInstance({ dispatch }, { device }) {
  if (device && device.id) {
    return dispatch('updateInstance', { device });
  }
  return dispatch('createInstance', { device });
}

export async function createInstance({ state, commit }, { device }) {
  try {
    const createdDevice = await loopback.post(`/${state.resources}`, device);
    commit('setModel', createdDevice);
    commit('setStateKV', {
      key: 'success',
      value: { message: 'device created' },
    });
    logger.publish(3, state.collectionName, 'dispatch:createInstance:res', createdDevice);
    return createdDevice;
  } catch (error) {
    logger.publish(2, state.collectionName, 'dispatch:createInstance:err', error);
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
    logger.publish(3, state.collectionName, 'dispatch:updateInstance:res', updatedDevice);
    return updatedDevice;
  } catch (error) {
    logger.publish(2, state.collectionName, 'dispatch:updateInstance:err', error);
    commit('setStateKV', { key: 'error', value: error });
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
    logger.publish(3, state.collectionName, 'dispatch:deleteInstance:res', deletedDevice);
    return deletedDevice;
  } catch (error) {
    logger.publish(2, state.collectionName, 'dispatch:deleteInstance:err', error);
    commit('setStateKV', { key: 'error', value: error });
    throw error;
  }
}

export async function refreshToken({ state, commit }, device) {
  return loopback
    .post(`/${state.resources}/refresh-token`, { device })
    .then((res) => {
      logger.publish(4, state.collectionName, 'dispatch:refreshToken:res', res);
      commit('setModel', res);
      return res;
    })
    .catch((err) => err);
}

export async function subscribeToDevicesUpdate({ state }, { userId }) {
  return state.collection.map(async (device) =>
    PubSub.subscribeToInstanceUpdate(socket.client, 'Device', userId, device.id),
  );
}

export async function unsubscribeFromDevicesUpdate({ state }, { ownerId }) {
  return state.collection.map(async (device) =>
    PubSub.unSubscribeWhere(socket.client, {
      collection: 'Device',
      userId: ownerId,
      method: 'PUT',
      modelId: device.id,
    }),
  );
}

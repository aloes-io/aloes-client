import loopback from '@/services/loopback';
import logger from '@/services/logger';

export async function search({ state, commit, dispatch }, filter) {
  try {
    logger.publish(4, state.collectionName, 'dispatch:search:req', filter);
    if (!filter.limit) {
      filter.limit = 50;
    }
    if (state.model.type && state.model.type.toLowerCase() === 'sensor') {
      await dispatch('searchSensors', filter);
    } else if (state.model.type && state.model.type.toLowerCase() === 'device') {
      await dispatch('searchDevices', filter);
    } else {
      throw new Error('Missing search type');
    }
  } catch (error) {
    commit('setModelKV', { key: 'error', value: error });
    throw error;
  }
}

export async function searchDevices({ state, commit }, filter) {
  try {
    logger.publish(4, state.collectionName, 'dispatch:searchDevices:req', filter);
    const devices = await loopback.post(`/Devices/search`, { filter });
    if (!devices || devices.length === 0) {
      const err = new Error('No result');
      throw err;
    }
    commit('setModelKV', { key: 'success', value: devices.length });
    commit('setModelKV', { key: 'results', value: { type: 'device', content: devices } });
    return devices;
  } catch (error) {
    commit('setModelKV', { key: 'error', value: error });
    throw error;
  }
}

export async function searchSensors({ state, commit }, filter) {
  try {
    logger.publish(4, state.collectionName, 'dispatch:searchSensors:req', filter);
    const sensors = await loopback.post(`/Sensors/search`, { filter });
    if (!sensors || sensors.length === 0) {
      const err = new Error('No result');
      throw err;
    }
    commit('setModelKV', { key: 'success', value: sensors.length });
    commit('setModelKV', { key: 'results', value: { type: 'sensor', content: sensors } });
    return sensors;
  } catch (error) {
    commit('setModelKV', { key: 'error', value: error });
    throw error;
  }
}
export async function getDevicesByGeolocation({ state, commit }, filter) {
  try {
    logger.publish(4, state.collectionName, 'dispatch:getDevicesByGeolocation:req', filter);
    const devices = await loopback.post(`/Devices/geo-locate`, { filter });
    if (!devices || devices.length === 0) {
      const err = new Error('No result');
      throw err;
    }
    commit('setModelKV', { key: 'success', value: devices.length });
    commit('setModelKV', { key: 'results', value: { type: 'device', content: devices } });
    return devices;
  } catch (error) {
    commit('setModelKV', { key: 'error', value: error });
    throw error;
  }
}

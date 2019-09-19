import loopback from '@/services/loopback';
import logger from '@/services/logger';

export async function searchDevices({ state, commit }, filter) {
  try {
    logger.publish(4, state.collectionName, 'dispatch:searchDevices:req', filter);
    const res = await loopback.post(`/Devices/search`, { filter });
    if (!res || res.length === 0) {
      const err = new Error('No result');
      throw err;
    }
    commit('setModelKV', { key: 'success', value: res.length });
    commit('setModelKV', { key: 'results', value: res });
    return res;
  } catch (error) {
    commit('setModelKV', { key: 'error', value: error });
    throw error;
  }
}

export async function getDevicesByGeolocation({ state, commit }, filter) {
  try {
    logger.publish(4, state.collectionName, 'dispatch:getDevicesByGeolocation:req', filter);
    const res = await loopback.post(`/Devices/geo-locate`, { filter });
    if (!res || res.length === 0) {
      const err = new Error('No result');
      throw err;
    }
    commit('setModelKV', { key: 'success', value: res.length });
    commit('setModelKV', { key: 'results', value: res });
    return res;
  } catch (error) {
    commit('setModelKV', { key: 'error', value: error });
    throw error;
  }
}

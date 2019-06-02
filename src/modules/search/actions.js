import loopback from '@/services/loopback';
import logger from '@/services/logger';

export async function searchDevices({ state, commit }, filter) {
  try {
    logger.publish(4, state.collectionName, 'dispatch:searchDevices:req', filter);
    const res = await loopback.post(`/Devices/search`, { filter });

    if (!res || !res.devices || res.devices.length < 1) {
      const err = new Error('No result');
      throw err;
    }
    await commit('setModelKV', { key: 'success', value: res.devices.length });
    await commit('setModelKV', { key: 'results', value: res.devices });
    return res.devices;
  } catch (error) {
    await commit('setModelKV', { key: 'error', value: error });
    return error;
  }
}

export async function getDevicesByGeolocation({ state, commit }, filter) {
  try {
    logger.publish(4, state.collectionName, 'dispatch:getDevicesByGeolocation:req', filter);
    const res = await loopback.post(`/Devices/geo-locate`, { filter });
    if (!res || !res.devices || res.devices.length === 0) {
      const err = new Error('No result');
      throw err;
    }
    commit('setModelKV', { key: 'success', value: res.devices.length });
    commit('setModelKV', { key: 'results', value: res.devices });
    return res.devices;
  } catch (error) {
    await commit('setModelKV', { key: 'error', value: error });
    return error;
  }
}

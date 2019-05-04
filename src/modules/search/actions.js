import loopback from '@/services/loopback';
import logger from '@/services/logger';

export async function searchDevices({ state, commit }, filter) {
  try {
    logger.publish(4, state.collectionName, 'dispatch:searchDevices:req', filter);
    const devices = await loopback
      .post(`/Devices/text-search`, { filter })
      .then(res => res.result)
      .catch(err => {
        commit('setModelKV', { key: 'error', value: err });
        return err;
      });
    if (devices.length < 1) {
      const error = new Error('No result');
      await commit('setModelKV', { key: 'error', value: error });
      return error;
    }
    await commit('setModelKV', { key: 'success', value: devices.length });
    await commit('setModelKV', { key: 'results', value: devices });
    return devices;
  } catch (error) {
    return error;
  }
}

export async function getDevicesByGeolocation({ state, commit }, filter) {
  try {
    logger.publish(4, state.collectionName, 'dispatch:getDevicesByGeolocation:req', filter);
    const devices = await loopback
      .post(`/Devices/geo-locate`, { filter })
      .then(res => res.result)
      .catch(err => {
        commit('setModelKV', { key: 'error', value: err });
        return err;
      });
    if (devices.length === 0) {
      const error = new Error('No result');
      await commit('setModelKV', { key: 'error', value: error });
      return error;
    }
    commit('setModelKV', { key: 'success', value: devices.length });
    commit('setModelKV', { key: 'results', value: devices });
    return devices;
  } catch (error) {
    return error;
  }
}

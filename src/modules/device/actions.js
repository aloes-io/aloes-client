import loopback from '@/services/loopback';
import socket from '@/services/socket';
import PubSub from '@/services/PubSub';
import logger from '@/services/logger';

//  const userResources = 'users';

export async function findDevicesByAccount({ state, commit }, ownerId) {
  try {
    const devices = await loopback.find(`/${state.resources}`, {
      where: { ownerId },
      include: ['sensors', 'deviceAddress'],
      limit: 40,
    });

    const sensors = devices.map(device => {
      if (device.sensors) {
        return device.sensors;
      }
      return;
    });
    commit('setStateKV', { key: 'sensorsCollection', value: sensors });
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
    return error;
  }
}

export async function findDeviceKV({ state, commit }, { key, value }) {
  // define limit base on acccount type ?
  try {
    const devices = await loopback.find(`/${state.resources}`, {
      where: { [key]: value },
      include: 'sensors',
      limit: 40,
    });
    //  commit('setCollection', devices);
    // devices.forEach((device) => {
    //   commit("setSensors", device.sensors);
    // });
    return devices;
  } catch (error) {
    await commit('setModelKV', { key: 'error', value: error });
    logger.publish(2, state.collectionName, 'dispatch:findDeviceKV:err', error);
    return error;
  }
}

export async function subscribeToDevicesUpdate({ state }, { userId }) {
  await state.collection.forEach(device => {
    return PubSub.subscribeToInstanceUpdate(socket.client, 'Device', userId, device.id);
  });
}

export async function unsubscribeFromDevicesUpdate({ state }, { ownerId }) {
  await state.collection.forEach(device =>
    PubSub.unSubscribeWhere(socket.client, {
      collectionName: 'Device',
      userId: ownerId,
      method: 'PUT',
      modelId: device.id,
    }),
  );
}

export async function saveDevice({ dispatch }, { device }) {
  if (device.id) {
    return dispatch('updateDevice', { device });
  }
  return dispatch('createDevice', { device });
}

export async function createDevice({ state, commit }, { device }) {
  try {
    const createdDevice = await loopback.post(`/${state.resources}`, device);
    //.post(`/${userResources}/${device.ownerId}/${state.resources.toLowerCase()}`, device)
    await commit('setModel', createdDevice);
    await commit('setModelKV', {
      key: 'success',
      value: { message: 'device created' },
    });
    return createdDevice;
  } catch (error) {
    await commit('setModelKV', { key: 'error', value: error });
    return error;
  }
}

export async function updateDevice({ state, commit }, { device }) {
  try {
    const updatedDevice = await loopback.put(`/${state.resources}/${device.id}`, device);
    await commit('setModel', updatedDevice);
    await commit('setModelKV', {
      key: 'success',
      value: { message: 'device updated' },
    });
    return updatedDevice;
  } catch (error) {
    await commit('setModelKV', { key: 'error', value: error });
    return error;
  }
}

export async function delDevice({ state, commit }, { device }) {
  try {
    const deletedDevice = await loopback.delete(`/${state.resources}/${device.id}`);
    await commit('setModelKV', {
      key: 'success',
      value: { message: 'device removed' },
    });
    return deletedDevice;
  } catch (error) {
    await commit('setModelKV', { key: 'error', value: error });
    return error;
  }
}

export async function findSensorsByDevice({ state, commit }, deviceId) {
  return loopback
    .get(`/${state.resources}/${deviceId}/sensors`)
    .then(sensors => {
      commit('setStateKV', { key: 'sensors', value: sensors });
      //  logger.publish(3, state.collectionName, "dispatch:findSensorsByDevice:res", sensors);
      return sensors;
    })
    .catch(err => err);
}

export async function subscribeToSensorsUpdate({ state }, { userId }) {
  try {
    await state.sensors.forEach(sensor => {
      return PubSub.subscribeToInstanceUpdate(socket.client, 'Sensor', userId, sensor.id);
    });
  } catch (error) {
    return error;
  }
}

export async function unsubscribeFromSensorsUpdate({ state }, { userId }) {
  await state.sensors.forEach(sensor =>
    PubSub.unSubscribeWhere(socket.client, {
      collectionName: 'Sensor',
      userId,
      method: 'PUT',
      modelId: sensor.id,
    }),
  );
}

export async function publishToSensor({ state }, { sensor, userId }) {
  return PubSub.publishToInstance(socket.client, state.outputTopic, userId, sensor.id, sensor);
}

export async function updateSensor({ state, commit }, { sensor }) {
  try {
    const updatedSensor = await loopback.put(
      `/${state.resources}/${sensor.deviceId}/sensors/${sensor.id}`,
      sensor,
    );
    //  logger.publish(3, state.collectionName, 'dispatch:updateSensor:res', updatedSensor);
    // todo : create a cache with this structure :
    // devices = { deviceId: {instance} }
    // sensors = { sensorId: {instance} }
    //  const sensors = JSON.parse(JSON.stringify(state.sensors));
    //  commit('setStateKV', {key: 'sensors', value: sensors});

    await commit('setModelKV', {
      key: 'success',
      value: { message: 'sensor updated' },
    });
    return updatedSensor;
  } catch (error) {
    await commit('setModelKV', { key: 'error', value: error });
    logger.publish(4, state.collectionName, 'dispatch:updateSensor:err', error);
    return error;
  }
}

export async function delSensor({ state, commit }, { deviceId, sensor }) {
  try {
    const deletedSensor = await loopback.delete(
      `/${state.collectionName}/${deviceId}/sensors/${sensor.id}`,
    );
    await commit('setModelKV', {
      key: 'success',
      value: { message: 'sensor removed' },
    });
    return deletedSensor;
  } catch (error) {
    await commit('setModelKV', { key: 'error', value: error });
    logger.publish(4, state.collectionName, 'dispatch:delSensor:err', error);
    return error;
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

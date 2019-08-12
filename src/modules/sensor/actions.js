import loopback from '@/services/loopback';
import socket from '@/services/socket';
import PubSub from '@/services/PubSub';
import logger from '@/services/logger';

export async function findByDevice({ state, commit }, deviceId) {
  return loopback
    .get(`/Devices/${deviceId}/${state.resources}`)
    .then(sensors => {
      commit('setStateKV', { key: 'deviceSensors', value: sensors });
      //  logger.publish(3, state.collectionName, "dispatch:findSensorsByDevice:res", sensors);
      return sensors;
    })
    .catch(err => err);
}

export async function updateInstance({ state, commit }, { sensor }) {
  try {
    const sensorId = sensor.id;
    delete sensor.id;
    const updatedSensor = await loopback.put(`/${state.resources}/${sensorId}`, sensor);
    if (updatedSensor && updatedSensor !== null) {
      await commit('setStateKV', {
        key: 'success',
        value: { message: 'sensor updated' },
      });
      return updatedSensor;
    }

    throw new Error('Cannot update Sensor');
  } catch (error) {
    await commit('setStateKV', { key: 'error', value: error });
    logger.publish(4, state.collectionName, 'dispatch:updateInstance:err', error);
    return error;
  }
}

export async function deleteInstance({ state, commit }, { sensor }) {
  try {
    const deletedSensor = await loopback.delete(`/${state.resources}/${sensor.id}`);
    await commit('setStateKV', {
      key: 'success',
      value: { message: 'sensor removed' },
    });
    return deletedSensor;
  } catch (error) {
    await commit('setStateKV', { key: 'error', value: error });
    logger.publish(4, state.collectionName, 'dispatch:deleteInstance:err', error);
    return error;
  }
}

export async function subscribeToSensorsUpdate({ state }, { userId }) {
  try {
    await state.collection.forEach(sensor => {
      return PubSub.subscribeToInstanceUpdate(socket.client, 'Sensor', userId, sensor.id);
    });
  } catch (error) {
    return error;
  }
}

export async function unsubscribeFromSensorsUpdate({ state }, { userId }) {
  await state.collection.forEach(sensor =>
    PubSub.unSubscribeWhere(socket.client, {
      collection: 'Sensor',
      userId,
      method: 'PUT',
      modelId: sensor.id,
    }),
  );
}

export async function publish({ state }, { sensor, userId }) {
  return PubSub.publishToInstance(socket.client, state.collectionName, userId, sensor.id, sensor);
  //  return PubSub.publishToInstance(socket.client, state.outputTopic, userId, sensor.id, sensor);
}

import loopback from '@/services/loopback';
import socket from '@/services/socket';
import PubSub from '@/services/PubSub';
import logger from '@/services/logger';

export async function findByAccount({ state, commit }, { ownerId, filter }) {
  try {
    let sensors = await loopback.find(`/${state.resources}`, {
      where: { ownerId },
      // include: filter.include || ['measurement'],
      limit: filter.limit || 50,
      skip: filter.skip || 0,
    });
    logger.publish(4, state.collectionName, 'dispatch:findByAccount:req', filter);
    if (!sensors || sensors === null) {
      sensors = [];
    }
    sensors = JSON.parse(JSON.stringify(sensors));
    logger.publish(3, state.collectionName, 'dispatch:findByAccount:res', sensors.length);
    return sensors;
  } catch (error) {
    commit('setStateKV', { key: 'error', value: error });
    throw error;
  }
}

export async function countByAccount({ state, commit }, { ownerId }) {
  try {
    const res = await loopback.find(`/${state.resources}/count`, {
      where: { ownerId },
    });

    logger.publish(3, state.collectionName, 'dispatch:countByAccount:res', res.count);
    commit('setStateKV', { key: 'collectionCount', value: res.count });
    return res.count;
  } catch (error) {
    throw error;
  }
}

export async function findByDevice({ state }, { deviceId, filter }) {
  try {
    logger.publish(3, state.collectionName, 'dispatch:findByDevice:req', filter);
    const sensors = await loopback.find(`/Devices/${deviceId}/${state.resources}`, {
      // include: ['measurement'],
      limit: filter.limit || 50,
      skip: filter.skip || 0,
    });
    // sensors = JSON.parse(JSON.stringify(sensors));
    logger.publish(3, state.collectionName, 'dispatch:findByDevice:res', sensors.length);
    return sensors;
  } catch (error) {
    throw error;
  }
}

export async function countByDevice({ state, commit }, { deviceId }) {
  try {
    const res = await loopback.find(`/Devices/${deviceId}/${state.resources}/count`);
    logger.publish(3, state.collectionName, 'dispatch:countByDevice:res', res.count);
    commit('setStateKV', { key: 'deviceSensorsCount', value: res.count });
    return res.count;
  } catch (error) {
    throw error;
  }
}

export async function updateInstance({ state, commit }, { sensor }) {
  try {
    const sensorId = sensor.id;
    delete sensor.id;
    const updatedSensor = await loopback.put(`/${state.resources}/${sensorId}`, sensor);
    if (updatedSensor && updatedSensor !== null) {
      commit('setStateKV', {
        key: 'success',
        value: { message: 'sensor updated' },
      });
      return updatedSensor;
    }

    throw new Error('Cannot update Sensor');
  } catch (error) {
    commit('setStateKV', { key: 'error', value: error });
    logger.publish(4, state.collectionName, 'dispatch:updateInstance:err', error);
    throw error;
  }
}

export async function deleteInstance({ state, commit }, { sensor }) {
  try {
    const deletedSensor = await loopback.delete(`/${state.resources}/${sensor.id}`);
    commit('setStateKV', {
      key: 'success',
      value: { message: 'sensor removed' },
    });
    return deletedSensor;
  } catch (error) {
    commit('setStateKV', { key: 'error', value: error });
    logger.publish(4, state.collectionName, 'dispatch:deleteInstance:err', error);
    throw error;
  }
}

export async function subscribeToSensorsUpdate({ state }, { userId }) {
  return state.collection.map(async sensor =>
    PubSub.subscribeToInstanceUpdate(socket.client, 'Sensor', userId, sensor.id),
  );
}

export async function unsubscribeFromSensorsUpdate({ state }, { userId }) {
  return state.collection.map(async sensor =>
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

/* Copyright 2020 Edouard Maleix, read LICENSE */

import loopback from '@/services/loopback';
import socket from '@/services/socket';
import PubSub from '@/services/PubSub';
import logger from '@/services/logger';

const sensorResources = 'resources';

export async function findByAccount({ state, commit, dispatch }, { ownerId, filter }) {
  try {
    let sensors = await loopback.find(`/${state.resources}`, {
      where: { ownerId },
      // include: filter.include || ['measurement'],
      limit: filter.limit || 50,
      skip: filter.skip || 0,
    });
    logger.publish(4, state.collectionName, 'dispatch:findByAccount:req', filter);
    if (!sensors || sensors === null) sensors = [];
    sensors = await dispatch('attachResourcesToSensors', { sensors });

    // else sensors = JSON.parse(JSON.stringify(sensors));
    logger.publish(3, state.collectionName, 'dispatch:findByAccount:res', sensors.length);
    return sensors;
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

export async function findByDevice({ state, dispatch }, { deviceId, filter }) {
  logger.publish(3, state.collectionName, 'dispatch:findByDevice:req', filter);
  let sensors = await loopback.find(`/Devices/${deviceId}/${state.resources}`, {
    // include: ['measurement'],
    limit: filter.limit || 50,
    skip: filter.skip || 0,
  });
  if (!sensors || sensors === null) sensors = [];
  sensors = await dispatch('attachResourcesToSensors', { sensors });

  // else sensors = JSON.parse(JSON.stringify(sensors));
  logger.publish(3, state.collectionName, 'dispatch:findByDevice:res', sensors.length);
  return sensors;
}

export async function countByDevice({ state, commit }, { deviceId }) {
  const res = await loopback.find(`/Devices/${deviceId}/${state.resources}/count`);
  const count = res.count || 0;
  logger.publish(3, state.collectionName, 'dispatch:countByDevice:res', count);
  commit('setStateKV', { key: 'deviceSensorsCount', value: count });
  return count;
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
    logger.publish(4, state.collectionName, 'dispatch:updateInstance:err', error);
    commit('setStateKV', { key: 'error', value: error });
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
    logger.publish(3, state.collectionName, 'dispatch:deleteInstance:res', deletedSensor);
    return deletedSensor;
  } catch (error) {
    logger.publish(4, state.collectionName, 'dispatch:deleteInstance:err', error);
    commit('setStateKV', { key: 'error', value: error });
    throw error;
  }
}

export async function attachResourcesToSensors({ dispatch }, { sensors }) {
  return Promise.all(
    sensors.map(async (sensor) => {
      sensor.resources = await dispatch('findResources', { sensorId: sensor.id });
      return sensor;
    }),
  );
}

export async function findResources({ state }, { sensorId }) {
  try {
    const resources = await loopback.get(`/${state.resources}/${sensorId}/${sensorResources}`);
    // where to store resources ?
    return resources;
  } catch (error) {
    logger.publish(4, state.collectionName, 'dispatch:findResources:err', error);
    return null;
  }
}

export async function updateResources({ state }, { sensorId, resources }) {
  const updatedResources = await loopback.put(
    `/${state.resources}/${sensorId}/${sensorResources}`,
    resources,
  );

  return updatedResources;
}

export async function deleteResources({ state }, { sensorId }) {
  const deletedResources = await loopback.delete(
    `/${state.resources}/${sensorId}/${sensorResources}`,
  );
  logger.publish(3, state.collectionName, 'dispatch:deleteResources:res', deletedResources);
  return deletedResources;
}

export async function subscribeToSensorsUpdate({ state }, { userId }) {
  return state.collection.map(async (sensor) =>
    PubSub.subscribeToInstanceUpdate(socket.client, 'Sensor', userId, sensor.id),
  );
}

export async function unsubscribeFromSensorsUpdate({ state }, { userId }) {
  return state.collection.map(async (sensor) =>
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
}

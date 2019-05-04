import Vue from 'vue';
import mqttPattern from 'mqtt-pattern';
//  import {publish, omaObjects} from "aloes-handlers";
import logger from './logger';

export const EventBus = new Vue();

const Storage = window.localStorage;
const PubSub = {};

const pushContainer = subscriptionName => {
  if (!subscriptionName || subscriptionName !== null) return false;
  logger.publish(4, 'PubSub', 'pushContainer:req', subscriptionName);
  let container = JSON.parse(Storage.getItem('subscription-container'));
  if (!container || container === null) {
    Storage.setItem('subscription-container', '[]');
    //  container = JSON.parse(Storage.getItem('subscription-container'));
    container = [];
  }
  const index = container.indexOf(subscriptionName);
  //  if (container.find((name) => name === subscriptionName)) return true;
  if (index !== -1) {
    return true;
  }
  container.push(subscriptionName);
  Storage.setItem('subscription-container', JSON.stringify(container));
  logger.publish(5, 'PubSub', 'pushContainer:res', container);
  return true;
};

PubSub.subscribe = async (client, options) => {
  try {
    logger.publish(4, 'pubsub', 'subscribe:req', options);
    if (client && options) {
      let route;
      const collectionPattern = '+userId/+collectionName/+method';
      const instancePattern = '+userId/+collectionName/+method/+modelId';
      const params = {
        userId: options.userId,
        collectionName: options.collectionName,
        modelId: options.modelId,
        method: options.method,
      };
      if (options.method === 'POST') {
        route = mqttPattern.fill(collectionPattern, params);
      } else if (options.method === 'DELETE') {
        route = mqttPattern.fill(collectionPattern, params);
      } else if (options.method === 'PUT') {
        route = mqttPattern.fill(collectionPattern, params);
      } else {
        route = mqttPattern.fill(instancePattern, params);
      }
      await client.subscribe(route, { qos: 1 });
      return pushContainer(route);
    }
    throw new Error('Error: Option must be an object type');
  } catch (error) {
    logger.publish(2, 'pubsub', 'subscribe:err', error);
    return error;
  }
};

PubSub.unSubscribeWhere = async (client, options) => {
  try {
    if (options && client && Storage) {
      const name = `/${options.userId}/${options.collectionName}/${options.method}`;
      logger.publish(4, 'pubsub', 'unSubscribeWhere:req', name);
      const container = JSON.parse(Storage.getItem('subscription-container'));
      const index = container.indexOf(name);
      if (index !== -1) {
        container.splice(index, 1);
        await client.unsubscribe(name);
        //  delete socket._callbacks[`$/${name}`];
        //  EventBus.$off(`${options.method.toLowerCase()}${options.collectionName}`);
        //  delete EventBus._events[`${options.method.toLowerCase()}${options.collectionName}`];
        Storage.setItem('subscription-container', JSON.stringify(container));
        logger.publish(
          4,
          'pubsub',
          'unSubscribeWhere:res',
          JSON.parse(Storage.getItem('subscription-container')),
        );
        return true;
      }
      throw new Error('unSubscribeWhere:err : element not found');
    }
    throw new Error('unSubscribeWhere:err Invalid Params');
  } catch (error) {
    logger.publish(2, 'pubsub', 'unSubscribeWhere:err', error);
    return error;
  }
};

PubSub.removeListeners = async client => {
  try {
    if (client && Storage) {
      const container = JSON.parse(Storage.getItem('subscription-container'));
      await container.forEach(async route => {
        await client.unsubscribe(route);
        //  delete socket._callbacks[`$/${route}`];
        //  const options = route.split("/");
        //  console.log(`${options[3].toLowerCase()}${options[2]}`);
        // EventBus.$off(`${options[3].toLowerCase()}${options[2]}`);
        // delete EventBus._events[`${options[3].toLowerCase()}${options[2]}`];
      });
      await Storage.setItem('subscription-container', '[]');
      return null;
    }
    throw new Error('unSubscribeAll:err Invalid Params');
  } catch (error) {
    logger.publish(2, 'pubsub', 'removeListeners:err', error);
    return error;
  }
};

PubSub.subscribeToCollectionCreation = async (client, collectionName, userId) =>
  await PubSub.subscribe(client, {
    userId,
    collectionName,
    method: 'POST',
  });

PubSub.subscribeToCollectionDeletion = async (client, collectionName, userId) =>
  await PubSub.subscribe(client, {
    userId,
    collectionName,
    method: 'DELETE',
  });

PubSub.subscribeToCollectionUpdate = async (client, collectionName, userId) =>
  await PubSub.subscribe(client, {
    userId,
    collectionName,
    method: 'PUT',
  });

PubSub.subscribeToInstanceUpdate = async (client, collectionName, userId, modelId) =>
  await PubSub.subscribe(client, {
    userId,
    collectionName,
    modelId,
    method: 'PUT',
  });

PubSub.setListeners = async (client, token) => {
  try {
    logger.publish(4, 'PubSub', 'setListeners', token);
    if (client && client !== null && token && token !== null) {
      await PubSub.subscribeToCollectionCreation(client, 'Notification', token.userId);
      await PubSub.subscribeToCollectionCreation(client, 'Message', token.userId);
      await PubSub.subscribeToCollectionCreation(client, 'Device', token.userId);
      await PubSub.subscribeToCollectionCreation(client, 'Sensor', token.userId);
      await PubSub.subscribeToCollectionDeletion(client, 'Message', token.userId);
      await PubSub.subscribeToCollectionDeletion(client, 'Device', token.userId);
      await PubSub.subscribeToCollectionDeletion(client, 'Sensor', token.userId);
      await PubSub.subscribeToCollectionUpdate(client, 'Device', token.userId);
      await PubSub.subscribeToCollectionUpdate(client, 'Sensor', token.userId);
    }
    throw new Error('No valid MQTT client found');
  } catch (error) {
    logger.publish(2, 'pubsub', 'setListeners:err', error);
    return error;
  }
};

const onCollectionCreated = (collectionName, instance) => {
  logger.publish(4, 'PubSub', `on${collectionName}Created`, instance);
  EventBus.$emit(`on${collectionName}Created`, instance);
};

const onCollectionDeleted = (collectionName, instance) => {
  logger.publish(4, 'PubSub', `on${collectionName}Deleted`, instance);
  EventBus.$emit(`on${collectionName}Deleted`, instance);
};

const onCollectionUpdated = (collectionName, instance) => {
  logger.publish(4, 'PubSub', `on${collectionName}Updated`, instance);
  EventBus.$emit(`on${collectionName}Updated`, instance);
};

const extractProtocol = (pattern, topic) =>
  new Promise((resolve, reject) => {
    const protocol = mqttPattern.exec(pattern, topic);
    if (protocol !== null) resolve(protocol);
    reject(protocol);
  });

const protocolParser = async topic => {
  logger.publish(4, 'pubsub', 'protocolParser:req', topic);
  const instancePattern = '+userId/+collectionName/+method/+modelId';
  const collectionPattern = '+userId/+collectionName/+method';
  let aloesClientProtocol = null;
  if (mqttPattern.matches(collectionPattern, topic)) {
    aloesClientProtocol = await extractProtocol(collectionPattern, topic);
  }
  if (mqttPattern.matches(instancePattern, topic)) {
    aloesClientProtocol = await extractProtocol(instancePattern, topic);
  }
  return aloesClientProtocol;
};

PubSub.handler = async (topic, message) => {
  try {
    logger.publish(4, 'PubSub', 'handler:req', JSON.parse(message));
    const protocol = await protocolParser(topic);
    if (protocol.method && protocol.collectionName) {
      message = JSON.parse(message);
      switch (protocol.method) {
        case 'POST':
          switch (protocol.collectionName) {
            case 'Device':
              await onCollectionCreated('Device', message);
              break;
            case 'Sensor':
              await onCollectionCreated('Sensor', message);
              break;
            case 'VirtualObject':
              await onCollectionCreated('VirtualObject', message);
              break;
            case 'Notification':
              await onCollectionCreated('Notification', message);
              break;
            default:
              logger.publish(4, 'PubSub', `on${protocol.collectionName}Created`, message);
          }
          break;
        case 'DELETE':
          switch (protocol.collectionName) {
            case 'Device':
              await onCollectionDeleted('Device', message);
              break;
            case 'Sensor':
              await onCollectionDeleted('Sensor', message);
              break;
            case 'VirtualObject':
              await onCollectionDeleted('VirtualObject', message);
              break;
            default:
              logger.publish(4, 'PubSub', `on${protocol.collectionName}Deleted`, message);
          }
          break;
        case 'PUT':
          switch (protocol.collectionName) {
            case 'Device':
              await onCollectionUpdated('Device', message);
              break;
            case 'Sensor':
              await onCollectionUpdated('Sensor', message);
              break;
            case 'VirtualObject':
              await onCollectionUpdated('VirtualObject', message);
              break;
            default:
              logger.publish(4, 'PubSub', `on${protocol.collectionName}Updated`, message);
          }
          break;
        default:
          logger.publish(4, 'PubSub', protocol.collectionName, 'unknown operation');
      }
      return null;
    }
    throw new Error('Invalid protocol');
  } catch (error) {
    logger.publish(2, 'pubsub', 'handler:err', error);
    return error;
  }
};

PubSub.publish = async (client, options) => {
  try {
    logger.publish(4, 'pubsub', 'publish:req', options);
    if (options && client) {
      const instancePattern = '+userId/+collectionName/+method/+modelId';
      const params = {
        userId: options.userId,
        collectionName: options.collectionName,
        modelId: options.modelId,
        method: options.method,
      };
      const route = mqttPattern.fill(instancePattern, params);
      await client.publish(route, JSON.stringify(options.payload), { qos: 1 });
      return null;
    }
    throw new Error('Option must be an object type');
  } catch (error) {
    logger.publish(2, 'pubsub', 'publish:err', error);
    return error;
  }
};

PubSub.publishToInstance = (client, collectionName, userId, modelId, payload) =>
  PubSub.publish(client, {
    userId,
    collectionName,
    modelId,
    method: 'PUT',
    payload,
  });

PubSub.close = client => {
  PubSub.removeListeners(client);
  //  EventBus.$off();
};

export default PubSub;

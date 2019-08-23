import { aloesClientPatternDetector, aloesClientEncoder } from 'aloes-handlers';
import debounce from 'lodash.debounce';
import Vue from 'vue';
import logger from './logger';

export const EventBus = new Vue();

const Storage = window.sessionStorage;
const PubSub = {};

const debounceDelay = 50;

const pushContainer = subscriptionName => {
  if (!subscriptionName || subscriptionName === null) return false;
  logger.publish(4, 'pubsub', 'pushContainer:req', subscriptionName);
  let container = JSON.parse(Storage.getItem('subscription-container'));
  if (!container || container === null) {
    Storage.setItem('subscription-container', '[]');
    //  container = JSON.parse(Storage.getItem('subscription-container'));
    container = [];
  }
  const index = container.indexOf(subscriptionName);
  //  if (container.find((name) => name === subscriptionName)) return true;
  if (index > -1) {
    return true;
  }
  container.push(subscriptionName);
  Storage.setItem('subscription-container', JSON.stringify(container));
  logger.publish(5, 'pubsub', 'pushContainer:res', container);
  return true;
};

PubSub.subscribe = async (client, options) => {
  try {
    logger.publish(5, 'pubsub', 'subscribe:req', options);
    if (client && options) {
      options.pattern = 'aloesClient';
      const packet = aloesClientEncoder(options);
      if (!packet || !packet.topic || packet.topic === null) throw new Error('No topic encoded');
      //  logger.publish(4, 'pubsub', 'subscribe:res', packet.topic);
      // let container = JSON.parse(Storage.getItem('subscription-container'));
      // const index = container.indexOf(packet.topic);
      // if (index > -1) {
      //   return null;
      // }
      await client.subscribe(packet.topic, { qos: 0 });
      return pushContainer(packet.topic);
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
      let name;
      if (!options.collection || !options.method || !options.userId) {
        throw new Error('Missing options');
      }
      if (options.modelId) {
        name = `/${options.userId}/${options.collection}/${options.method}/${options.modelId}`;
      } else {
        name = `/${options.userId}/${options.collection}/${options.method}`;
      }
      logger.publish(5, 'pubsub', 'unSubscribeWhere:req', name);
      let container = JSON.parse(Storage.getItem('subscription-container'));
      if (!container || container === null) {
        container = [];
      }
      const index = container.indexOf(name);
      if (index !== -1) {
        container.splice(index, 1);
        await client.unsubscribe(name);
        //  delete socket._callbacks[`$/${name}`];
        //  EventBus.$off(`${options.method.toLowerCase()}${options.collection}`);
        //  delete EventBus._events[`${options.method.toLowerCase()}${options.collection}`];
        Storage.setItem('subscription-container', JSON.stringify(container));
        logger.publish(
          4,
          'pubsub',
          'unSubscribeWhere:res',
          JSON.parse(Storage.getItem('subscription-container')),
        );
        return true;
      }
      return null;
    }
    throw new Error('Invalid Params');
  } catch (error) {
    logger.publish(2, 'pubsub', 'unSubscribeWhere:err', error);
    return error;
  }
};

PubSub.removeListeners = async client => {
  try {
    if (client && Storage) {
      let container = JSON.parse(Storage.getItem('subscription-container'));
      if (!container || container === null) {
        container = [];
      }
      container.forEach(async route => await client.unsubscribe(route));
      Storage.setItem('subscription-container', '[]');
      return null;
    }
    throw new Error('unSubscribeAll:err Invalid Params');
  } catch (error) {
    logger.publish(2, 'pubsub', 'removeListeners:err', error);
    return error;
  }
};

PubSub.subscribeToCollectionPresentation = async (client, collection, userId) =>
  PubSub.subscribe(client, {
    userId,
    collection,
    method: 'HEAD',
  });

PubSub.subscribeToCollectionCreation = async (client, collection, userId) =>
  PubSub.subscribe(client, {
    userId,
    collection,
    method: 'POST',
  });

PubSub.subscribeToCollectionDeletion = async (client, collection, userId) =>
  PubSub.subscribe(client, {
    userId,
    collection,
    method: 'DELETE',
  });

PubSub.subscribeToCollectionUpdate = async (client, collection, userId) =>
  PubSub.subscribe(client, {
    userId,
    collection,
    method: 'PUT',
  });

PubSub.subscribeToInstanceUpdate = async (client, collection, userId, modelId) =>
  PubSub.subscribe(client, {
    userId,
    collection,
    modelId,
    method: 'PUT',
  });

PubSub.setListeners = async (client, token) => {
  try {
    logger.publish(4, 'PubSub', 'setListeners', token);
    if (client && client !== null && token && token !== null) {
      await PubSub.subscribeToCollectionPresentation(client, 'Sensor', token.userId);
      await PubSub.subscribeToCollectionPresentation(client, 'Device', token.userId);
      await PubSub.subscribeToCollectionPresentation(client, 'Scheduler', token.userId);
      await PubSub.subscribeToCollectionCreation(client, 'Device', token.userId);
      await PubSub.subscribeToCollectionCreation(client, 'Sensor', token.userId);
      await PubSub.subscribeToCollectionDeletion(client, 'Device', token.userId);
      await PubSub.subscribeToCollectionDeletion(client, 'Sensor', token.userId);
      await PubSub.subscribeToCollectionUpdate(client, 'Device', token.userId);
      await PubSub.subscribeToCollectionUpdate(client, 'Sensor', token.userId);
      return null;
    }
    throw new Error('No valid MQTT client found');
  } catch (error) {
    logger.publish(2, 'pubsub', 'setListeners:err', error);
    return error;
  }
};

const onCollectionPresented = (collectionName, instance) => {
  logger.publish(4, 'PubSub', `on${collectionName}Presented`, instance.name);
  EventBus.$emit(`on${collectionName}Presented`, instance);
};

PubSub.onCollectionPresented = debounce(onCollectionPresented, debounceDelay);

const onCollectionCreated = (collectionName, instance) => {
  logger.publish(4, 'PubSub', `on${collectionName}Created`, instance.name);
  EventBus.$emit(`on${collectionName}Created`, instance);
};

PubSub.onCollectionCreated = debounce(onCollectionCreated, debounceDelay);

const onCollectionDeleted = (collectionName, instance) => {
  logger.publish(4, 'PubSub', `on${collectionName}Deleted`, instance.name);
  EventBus.$emit(`on${collectionName}Deleted`, instance);
};

PubSub.onCollectionDeleted = debounce(onCollectionDeleted, debounceDelay);

const onCollectionUpdated = (collectionName, instance) => {
  logger.publish(4, 'PubSub', `on${collectionName}Updated`, instance.name);
  EventBus.$emit(`on${collectionName}Updated`, instance);
};

PubSub.onCollectionUpdated = debounce(onCollectionUpdated, debounceDelay);

const handler = async (topic, message) => {
  try {
    logger.publish(5, 'PubSub', 'handler:req', JSON.parse(message));
    const pattern = await aloesClientPatternDetector({ topic, packet: message });
    let method = pattern.params.method;
    let collection = pattern.params.collection;
    if (!method || !collection) throw new Error('Invalid protocol');
    method = method.toUpperCase();
    collection = collection.toLowerCase();
    message = JSON.parse(message);
    switch (method) {
      case 'HEAD':
        switch (collection) {
          case 'device':
            await PubSub.onCollectionPresented('Device', message);
            break;
          case 'sensor':
            await PubSub.onCollectionPresented('Sensor', message);
            break;
          case 'scheduler':
            await PubSub.onCollectionPresented('Scheduler', message);
            break;
          default:
            throw new Error('Invalid collection name');
        }
        break;
      case 'POST':
        switch (collection) {
          case 'device':
            await PubSub.onCollectionCreated('Device', message);
            break;
          case 'sensor':
            await PubSub.onCollectionCreated('Sensor', message);
            break;
          case 'notification':
            await PubSub.onCollectionCreated('Notification', message);
            break;
          default:
            throw new Error('Invalid collection name');
        }
        break;
      case 'DELETE':
        switch (collection) {
          case 'device':
            await PubSub.onCollectionDeleted('Device', message);
            break;
          case 'sensor':
            await PubSub.onCollectionDeleted('Sensor', message);
            break;
          default:
            throw new Error('Invalid collection name');
        }
        break;
      case 'PUT':
        switch (collection) {
          case 'device':
            await PubSub.onCollectionUpdated('Device', message);
            break;
          case 'sensor':
            await PubSub.onCollectionUpdated('Sensor', message);
            break;
          default:
            throw new Error('Invalid collection name');
        }
        break;
      default:
        throw new Error('Invalid method');
    }
    return null;
  } catch (error) {
    logger.publish(2, 'pubsub', 'handler:err', error);
    return error;
  }
};

PubSub.handler = debounce(handler, debounceDelay);

PubSub.publish = async (client, options) => {
  try {
    logger.publish(4, 'pubsub', 'publish:req', options);
    if (options && client) {
      options.pattern = 'aloesClient';
      const packet = await aloesClientEncoder(options);
      if (!packet || !packet.topic || !packet.payload) throw new Error('No packet encoded');
      await client.publish(packet.topic, JSON.stringify(packet.payload), { qos: 0 });
      return null;
    }
    throw new Error('Option must be an object type');
  } catch (error) {
    logger.publish(2, 'pubsub', 'publish:err', error);
    return error;
  }
};

PubSub.publishToInstance = (client, collection, userId, modelId, data) =>
  PubSub.publish(client, {
    userId,
    collection,
    modelId,
    method: 'PUT',
    data,
  });

PubSub.close = async client => await PubSub.removeListeners(client);

export default PubSub;

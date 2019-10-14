import debounce from 'lodash.debounce';
import throttle from 'lodash.throttle';
import Vue from 'vue';
import logger from './logger';
import PacketWorker from '@/workers/packet.worker.js';

export const EventBus = new Vue();

const Storage = window.sessionStorage;
const PubSub = { hasListeners: false };
// const pubsubVersion = process.env.VUE_APP_PUBSUB_API_VERSION;
const debounceDelay = 50;
const throttleDelay = 150;

const lastMessage = { topic: '', payload: '', timestamp: 0 };

const pushContainer = subscriptionName => {
  if (!subscriptionName || subscriptionName === null) return false;
  logger.publish(4, 'pubsub', 'pushContainer:req', subscriptionName);
  let container;
  try {
    container = JSON.parse(Storage.getItem('subscription-container'));
  } catch (e) {
    container = [];
    Storage.setItem('subscription-container', '[]');
  }
  if (!container || container === null) {
    container = [];
    Storage.setItem('subscription-container', '[]');
  }
  const index = container.indexOf(subscriptionName);
  if (index > -1) {
    return true;
  }
  container.push(subscriptionName);
  Storage.setItem('subscription-container', JSON.stringify(container));
  logger.publish(3, 'pubsub', 'pushContainer:res', container);
  return true;
};

const packetEncoder = options => {
  return new Promise((resolve, reject) => {
    if (!options) {
      reject(new Error('Invalid arguments'));
    }
    // const packetWorker = new PacketWorker();
    const onMessage = e => {
      if (e.data.error) reject(new Error(e.data.error.message));
      const topic = e.data.topic || null;
      // packetWorker.terminate();
      if (!topic) reject(new Error('Invalid packet encoding'));
      logger.publish(4, 'PubSub', 'packetEncoder:res', topic);
      resolve(e.data);
    };
    // packetWorker.addEventListener('message', onMessage);
    PubSub.packetWorker.onmessage = onMessage;
    PubSub.packetWorker.onerror = reject;
    PubSub.packetWorker.postMessage({ options });
  });
};

const packetHandler = (topic, payload) => {
  return new Promise((resolve, reject) => {
    if (!topic || !payload) {
      reject(new Error('Invalid arguments'));
    }
    // const packetWorker = new PacketWorker();
    const onMessage = e => {
      if (e.data.error) reject(new Error(e.data.error.message));
      const pattern = e.data.pattern || null;
      // packetWorker.terminate();
      if (!pattern) reject(new Error('Invalid packet handling'));
      logger.publish(4, 'PubSub', 'packetHandler:res', e.data.topic);
      resolve(e.data);
    };
    // packetWorker.addEventListener('message', onMessage);
    PubSub.packetWorker.onmessage = onMessage;
    PubSub.packetWorker.onerror = reject;
    PubSub.packetWorker.postMessage({ topic, payload });
  });
};

PubSub.subscribe = async (client, options) => {
  try {
    logger.publish(4, 'pubsub', 'subscribe:req', options);
    if (client && options) {
      options.pattern = 'aloesClient';
      const packet = await packetEncoder(options);
      if (!packet || !packet.topic || packet.topic === null) throw new Error('No topic encoded');
      //  logger.publish(4, 'pubsub', 'subscribe:res', packet.topic);
      await client.subscribe(packet.topic, { qos: 0 });
      // await client.subscribe(`${pubsubVersion}/${packet.topic}`, { qos: 0 });
      return pushContainer(packet.topic);
    }
    throw new Error('Error: Option must be an object type');
  } catch (error) {
    logger.publish(2, 'pubsub', 'subscribe:err', error);
    throw error;
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
        name = `${options.userId}/${options.collection}/${options.method}/${options.modelId}`;
        // name = `${pubsubVersion}/${options.userId}/${options.collection}/${options.method}/${options.modelId}`;
      } else {
        name = `${options.userId}/${options.collection}/${options.method}`;
      }
      logger.publish(4, 'pubsub', 'unSubscribeWhere:req', name);

      let container;
      try {
        container = JSON.parse(Storage.getItem('subscription-container'));
      } catch (e) {
        container = [];
      }
      if (!container || container === null) {
        container = [];
      }
      const index = container.indexOf(name);
      if (index !== -1) {
        container.splice(index, 1);
        await client.unsubscribe(name);
        Storage.setItem('subscription-container', JSON.stringify(container));
        logger.publish(
          3,
          'pubsub',
          'unSubscribeWhere:res',
          Storage.getItem('subscription-container'),
        );
        return true;
      }
      return true;
    }
    throw new Error('Invalid Params');
  } catch (error) {
    logger.publish(2, 'pubsub', 'unSubscribeWhere:err', error);
    throw error;
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
    logger.publish(4, 'PubSub', 'setListeners:req', token);
    if (client && client !== null && token && token !== null) {
      if (!PubSub.hasListeners) {
        PubSub.packetWorker = new PacketWorker();

        await PubSub.subscribeToCollectionPresentation(client, 'Sensor', token.userId);
        await PubSub.subscribeToCollectionPresentation(client, 'Device', token.userId);
        await PubSub.subscribeToCollectionPresentation(client, 'Scheduler', token.userId);
        await PubSub.subscribeToCollectionCreation(client, 'Device', token.userId);
        await PubSub.subscribeToCollectionCreation(client, 'Sensor', token.userId);
        await PubSub.subscribeToCollectionDeletion(client, 'Device', token.userId);
        await PubSub.subscribeToCollectionDeletion(client, 'Sensor', token.userId);
        await PubSub.subscribeToCollectionUpdate(client, 'Device', token.userId);
        await PubSub.subscribeToCollectionUpdate(client, 'Sensor', token.userId);
        PubSub.hasListeners = true;
      }
      logger.publish(4, 'PubSub', 'setListeners:res', 'success');
      return;
    }
    throw new Error('No valid MQTT client found');
  } catch (error) {
    logger.publish(2, 'pubsub', 'setListeners:err', error);
    throw error;
  }
};

PubSub.removeListeners = async client => {
  try {
    logger.publish(3, 'pubsub', 'removeListeners:req', '');
    if (client && Storage) {
      if (PubSub.hasListeners) {
        let container;
        try {
          container = JSON.parse(Storage.getItem('subscription-container'));
        } catch (e) {
          container = [];
        }
        PubSub.packetWorker.terminate();

        PubSub.hasListeners = false;
        Storage.setItem('subscription-container', '[]');
        if (container && container.length > 0) {
          // container.map(async route => client.unsubscribe(route));
          Promise.all(container.map(route => client.unsubscribe(route)));
        }
        logger.publish(3, 'pubsub', 'removeListeners:res', 'success');
        return;
      }
      return;
    }
    throw new Error('unSubscribeAll:err Invalid Params');
  } catch (error) {
    PubSub.hasListeners = false;
    logger.publish(2, 'pubsub', 'removeListeners:err', error);
    throw error;
  }
};

const onCollectionPresented = (collectionName, instance) => {
  logger.publish(4, 'PubSub', `on${collectionName}Presented`, instance.name);
  EventBus.$emit(`on${collectionName}Presented`, instance);
};

PubSub.onCollectionPresented = throttle(onCollectionPresented, throttleDelay);

const onCollectionCreated = (collectionName, instance) => {
  logger.publish(4, 'PubSub', `on${collectionName}Created`, instance.name);
  EventBus.$emit(`on${collectionName}Created`, instance);
};

PubSub.onCollectionCreated = throttle(onCollectionCreated, throttleDelay);

const onCollectionDeleted = (collectionName, instance) => {
  logger.publish(4, 'PubSub', `on${collectionName}Deleted`, instance.name);
  EventBus.$emit(`on${collectionName}Deleted`, instance);
};

PubSub.onCollectionDeleted = throttle(onCollectionDeleted, throttleDelay);

const onCollectionUpdated = (collectionName, instance) => {
  logger.publish(4, 'PubSub', `on${collectionName}Updated`, instance.name);
  EventBus.$emit(`on${collectionName}Updated`, instance);
};

PubSub.onCollectionUpdated = throttle(onCollectionUpdated, throttleDelay);

const handler = async (topic, payload) => {
  try {
    if (lastMessage.topic === topic && lastMessage.timestamp > Date.now() - debounceDelay * 4) {
      // debounceDelay = 150;
      return;
    }
    logger.publish(5, 'PubSub', 'handler:req', topic);
    const res = await packetHandler(topic, payload.toString());
    const pattern = res.pattern;
    logger.publish(3, 'PubSub', 'handler:res', pattern);
    const method = res.method;
    const collection = res.collection;
    if (!pattern || !method || !collection) throw new Error('Invalid protocol');
    payload = res.payload;

    switch (method) {
      case 'HEAD':
        switch (collection) {
          case 'device':
            PubSub.onCollectionPresented('Device', payload);
            break;
          case 'sensor':
            PubSub.onCollectionPresented('Sensor', payload);
            break;
          case 'scheduler':
            PubSub.onCollectionPresented('Scheduler', payload);
            break;
          default:
            throw new Error('Invalid collection name');
        }
        break;
      case 'POST':
        switch (collection) {
          case 'device':
            PubSub.onCollectionCreated('Device', payload);
            break;
          case 'sensor':
            PubSub.onCollectionCreated('Sensor', payload);
            break;
          case 'scheduler':
            PubSub.onCollectionPresented('Scheduler', payload);
            break;
          case 'measurement':
            PubSub.onCollectionPresented('Measurement', payload);
            break;
          default:
            throw new Error('Invalid collection name');
        }
        break;
      case 'DELETE':
        switch (collection) {
          case 'device':
            PubSub.onCollectionDeleted('Device', payload);
            break;
          case 'sensor':
            PubSub.onCollectionDeleted('Sensor', payload);
            break;
          default:
            throw new Error('Invalid collection name');
        }
        break;
      case 'PUT':
        switch (collection) {
          case 'device':
            PubSub.onCollectionUpdated('Device', payload);
            break;
          case 'sensor':
            PubSub.onCollectionUpdated('Sensor', payload);
            break;
          default:
            throw new Error('Invalid collection name');
        }
        break;
      default:
        throw new Error('Invalid method');
    }
    lastMessage.topic = topic;
    lastMessage.payload = payload;
    lastMessage.timestamp = Date.now();
    return;
  } catch (error) {
    logger.publish(2, 'pubsub', 'handler:err', error);
    throw error;
  }
};

PubSub.handler = debounce(handler, debounceDelay);
// PubSub.handler = handler;

PubSub.publish = async (client, options) => {
  try {
    logger.publish(4, 'pubsub', 'publish:req', options);
    if (options && client) {
      options.pattern = 'aloesClient';
      const packet = await packetEncoder(options);
      if (!packet || !packet.topic || !packet.payload) throw new Error('No packet encoded');
      // await client.publish(`${pubsubVersion}/${packet.topic}`, JSON.stringify(packet.payload), { qos: 0 });
      await client.publish(packet.topic, JSON.stringify(packet.payload), { qos: 0 });
      logger.publish(3, 'pubsub', 'publish:res', packet);
      return;
    }
    throw new Error('Option must be an object type');
  } catch (error) {
    logger.publish(2, 'pubsub', 'publish:err', error);
    throw error;
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

export default PubSub;

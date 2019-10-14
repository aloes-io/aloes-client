import logger from '@/services/logger';
import SensorWorker from '@/workers/sensor.worker.js';
import CollectionWorker from '@/workers/collection.worker.js';

const storePrefix = 'app_';

const Collection = {
  mounted() {
    if (!this.sensorWorker) this.sensorWorker = new SensorWorker();
    if (!this.collectionWorker) this.collectionWorker = new CollectionWorker();
    this.collectionWorker2 = new CollectionWorker();
  },

  beforeDestroy() {
    this.sensorWorker.terminate();
    this.collectionWorker.terminate();
    this.collectionWorker2.terminate();
  },

  methods: {
    batchCollection(collectionName, collection, operation, batch, serialize = false) {
      logger.publish(4, collectionName, 'batchCollection:req', { collectionName, operation });
      return new Promise((resolve, reject) => {
        if (!collectionName || !collection || !operation || !batch) {
          reject(new Error('Invalid arguments'));
        }
        // this.collectionWorker2 = new CollectionWorker();
        const onMessage = e => {
          if (e.data.error) reject(new Error(e.data.error.message));
          const collection = e.data.collection || null;
          // this.collectionWorker2.terminate();
          if (!collection || collection === null) reject(new Error('Invalid collection update'));
          logger.publish(4, collectionName, 'batchCollection:res', { count: collection.length });
          resolve(collection);
        };
        // this.collectionWorker.addEventListener('message', onMessage);
        this.collectionWorker2.onmessage = onMessage;
        this.collectionWorker2.onerror = reject;
        this.collectionWorker2.postMessage({
          collectionName,
          collection,
          operation,
          batch,
          serialize,
        });
      });
    },

    updateCollection(collectionName, collection, operation, instance, serialize = false) {
      logger.publish(4, collectionName, 'updateCollection:req', { collectionName, operation });
      return new Promise((resolve, reject) => {
        if (!collectionName || !collection || !operation || !instance) {
          reject(new Error('Invalid arguments'));
        }
        // this.collectionWorker = new CollectionWorker();
        const onMessage = e => {
          if (e.data.error) reject(new Error(e.data.error.message));
          const collection = e.data.collection || null;
          // this.collectionWorker.terminate();
          if (!collection || collection === null) reject(new Error('Invalid collection update'));
          logger.publish(4, 'sensor', 'updateCollection:res', { count: collection.length });
          resolve(collection);
        };
        this.collectionWorker.onmessage = onMessage;
        this.collectionWorker.onerror = reject;
        this.collectionWorker.postMessage({
          collectionName,
          collection,
          operation,
          instance,
          serialize,
        });
      });
    },

    updateSensor(sensor, resource, value) {
      return new Promise((resolve, reject) => {
        if (!sensor || !resource) {
          reject(new Error('Invalid arguments'));
        }
        // this.sensorWorker = new SensorWorker();
        const onMessage = e => {
          if (e.data.error) reject(new Error(e.data.error.message));
          const sensor = e.data.sensor || null;
          // this.sensorWorker.terminate();
          if (!sensor || sensor === null) reject(new Error('Invalid sensor update'));
          logger.publish(4, 'sensor', 'updateSensor:res', { sensor });
          sensor.lastSignal = new Date();
          sensor.method = 'PUT';
          resolve(sensor);
        };
        this.sensorWorker.onmessage = onMessage;
        this.sensorWorker.onerror = reject;
        this.sensorWorker.postMessage({ sensor, resource, value });
      });
    },

    getInstance(type, instanceId) {
      if (type !== 'sensor' && type !== 'device') return {};
      const instance = this.$storage.get(`${type}-${instanceId}`);
      return instance;
    },

    saveInstance(type, instance) {
      if (type !== 'sensor' && type !== 'device') return {};
      // this.$storage.set(`app_${type}-${instance.id}`, instance, { ttl: 60 * 1000 });
      this.$storage.set(`${type}-${instance.id}`, instance, { ttl: 60 * 1000 });
      return instance;
    },

    delInstance(type, instance) {
      if (type !== 'sensor' && type !== 'device') return {};
      this.$storage.del(`${type}-${instance.id}`);
      return instance;
    },

    getCollection(type) {
      if (type !== 'sensor' && type !== 'device') return [];
      const keys = this.$storage.keys();
      // console.log('getCollection', type, keys, this.$storage);
      return keys
        .map(key => {
          if (key.startsWith(storePrefix)) {
            key = key.slice(storePrefix.length, key.length);
          }
          if (key.search(type) !== -1) {
            const instance = this.$storage.get(key);
            return instance;
          }
        })
        .filter(val => val !== undefined);
    },

    saveCollection(type, collection) {
      return collection.map(instance => this.saveInstance(type, instance));
    },

    delCollection(type, collection) {
      return collection.map(instance => this.delInstance(type, instance));
    },
  },
};

export default Collection;

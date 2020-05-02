/* Copyright 2020 Edouard Maleix, read LICENSE */

import logger from '@/services/logger';
import SensorWorker from '@/workers/sensor.worker.js';
import CollectionWorker from '@/workers/collection.worker.js';

const Collection = {
  created() {
    this.sensorWorker = new SensorWorker();
    this.updateDeviceWorker = new CollectionWorker();
    this.updateSensorWorker = new CollectionWorker();
    this.batchDeviceWorker = new CollectionWorker();
    this.batchSensorWorker = new CollectionWorker();
  },

  destroyed() {
    this.sensorWorker.terminate();
    this.updateDeviceWorker.terminate();
    this.updateSensorWorker.terminate();
    this.batchDeviceWorker.terminate();
    this.batchSensorWorker.terminate();
  },

  methods: {
    batchSensorCollection(collection, operation, batch, serialize = false) {
      logger.publish(4, 'sensor', 'batchCollection:req', {
        operation,
        count: Array.isArray(collection) ? collection.length : 0,
        serialize,
      });
      return new Promise((resolve, reject) => {
        if (!operation || !batch) return reject(new Error('Invalid arguments'));
        const onMessage = e => {
          if (e.data.error) return reject(new Error(e.data.error.message));
          const collection = e.data.collection || [];
          logger.publish(3, 'sensor', 'batchCollection:res', {
            count: collection.length,
          });
          resolve(collection);
        };
        this.batchSensorWorker.onmessage = onMessage;
        this.batchSensorWorker.onerror = reject;
        this.batchSensorWorker.postMessage({
          collectionName: 'sensor',
          collection,
          operation,
          batch,
          serialize,
        });
      });
    },

    batchDeviceCollection(collection, operation, batch, serialize = false) {
      logger.publish(4, 'device', 'batchCollection:req', {
        operation,
        count: Array.isArray(collection) ? collection.length : 0,
        serialize,
      });
      return new Promise((resolve, reject) => {
        if (!operation || !batch) return reject(new Error('Invalid arguments'));
        // this.batchDeviceWorker = new CollectionWorker();
        const onMessage = e => {
          if (e.data.error) return reject(new Error(e.data.error.message));
          const collection = e.data.collection || [];
          // this.batchDeviceWorker.terminate();
          logger.publish(3, 'device', 'batchCollection:res', {
            count: collection.length,
          });
          resolve(collection);
        };
        this.batchDeviceWorker.onmessage = onMessage;
        this.batchDeviceWorker.onerror = reject;
        this.batchDeviceWorker.postMessage({
          collectionName: 'device',
          collection,
          operation,
          batch,
          serialize,
        });
      });
    },

    updateSensorCollection(collection, operation, instance, serialize = false) {
      logger.publish(4, 'sensor', 'updateCollection:req', {
        operation,
        count: Array.isArray(collection) ? collection.length : 0,
        serialize,
      });
      return new Promise((resolve, reject) => {
        if (!operation || !instance) return reject(new Error('Invalid arguments'));
        const onMessage = e => {
          if (e.data.error) return reject(new Error(e.data.error.message));
          const collection = e.data.collection || [];
          logger.publish(3, 'sensor', 'updateCollection:res', {
            count: collection.length,
          });
          resolve(collection);
        };
        this.updateSensorWorker.onmessage = onMessage;
        this.updateSensorWorker.onerror = reject;
        this.updateSensorWorker.postMessage({
          collectionName: 'sensor',
          collection,
          operation,
          instance,
          serialize,
        });
      });
    },

    updateDeviceCollection(collection, operation, instance, serialize = false) {
      logger.publish(4, 'device', 'updateCollection:req', {
        operation,
        count: Array.isArray(collection) ? collection.length : 0,
        serialize,
      });
      return new Promise((resolve, reject) => {
        if (!operation || !instance) return reject(new Error('Invalid arguments'));
        const onMessage = e => {
          if (e.data.error) return reject(new Error(e.data.error.message));
          const collection = e.data.collection || [];
          logger.publish(3, 'device', 'updateCollection:res', {
            count: collection.length,
          });
          resolve(collection);
        };
        this.updateDeviceWorker.onmessage = onMessage;
        this.updateDeviceWorker.onerror = reject;
        this.updateDeviceWorker.postMessage({
          collectionName: 'device',
          collection,
          operation,
          instance,
          serialize,
        });
      });
    },

    updateSensor(sensor, resource, value) {
      return new Promise((resolve, reject) => {
        if (!sensor || !resource) return reject(new Error('Invalid arguments'));
        const onMessage = e => {
          if (e.data.error) return reject(new Error(e.data.error.message));
          const sensor = e.data.sensor || null;
          if (!sensor || sensor === null) return reject(new Error('Invalid sensor update'));
          logger.publish(3, 'sensor', 'updateSensor:res', { sensor });
          sensor.lastSignal = new Date();
          sensor.method = 'PUT';
          resolve(sensor);
        };
        this.sensorWorker.onmessage = onMessage;
        this.sensorWorker.onerror = reject;
        this.sensorWorker.postMessage({ sensor, resource, value });
      });
    },
  },
};

export default Collection;

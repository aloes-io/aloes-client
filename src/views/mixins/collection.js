import logger from '@/services/logger';

const storePrefix = 'app_';

const Collection = {
  methods: {
    batchCollection(collectionName, collection, operation, batch) {
      logger.publish(4, collectionName, 'batchCollection:req', {
        collectionName,
        operation,
        count: collection.length,
      });
      if (
        collectionName === 'devices' ||
        collectionName === 'sensors' ||
        collectionName === 'files' ||
        collectionName === 'filesMeta'
      ) {
        if (!collection || collection === null) collection = [];
        batch.map(instance =>
          this.updateCollection(collectionName, collection, operation, instance, false),
        );
        return collection;
      }
      return null;
    },
    updateCollection(collectionName, collection, operation, instance, serialize = true) {
      logger.publish(4, collectionName, 'updateCollection:req', { collectionName, operation });
      const compareIds = source => {
        if (source && source.id) {
          return source.id.toString() === instance.id.toString();
        }
        return false;
      };

      if (
        collectionName === 'devices' ||
        collectionName === 'sensors' ||
        collectionName === 'files' ||
        collectionName === 'filesMeta'
      ) {
        if (!collection || collection === null) collection = [];
        let index;
        switch (operation) {
          case 'create':
            index = collection.findIndex(compareIds);
            if (index === -1) {
              logger.publish(5, collectionName, `${collectionName}Created`, index);
              collection.push(instance);
            } else {
              logger.publish(5, collectionName, `${collectionName}Updated`, index);
              collection[index] = instance;
            }
            break;
          case 'update':
            index = collection.findIndex(compareIds);
            if (index > -1) {
              logger.publish(5, collectionName, `${collectionName}Updated`, index);
              collection[index] = instance;
            }
            break;
          case 'delete':
            index = collection.findIndex(compareIds);
            if (index > -1) {
              logger.publish(5, collectionName, `${collectionName}Deleted`, index);
              collection.splice(index, 1);
            }
            break;
          default:
            throw new Error('Wrong operation');
        }
        if (serialize) {
          collection = JSON.parse(JSON.stringify(collection));
        }
        return collection;
      }
      return null;
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

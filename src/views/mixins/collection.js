import logger from '@/services/logger';

const Collection = {
  methods: {
    updateCollection(collection, operation, instance) {
      logger.publish(4, collection, 'updateCollection:req', { collection, operation });
      const compareIds = source => {
        if (source && source.id) {
          return source.id.toString() === instance.id.toString();
        }
        return false;
      };

      if (
        collection === 'devices' ||
        collection === 'sensors' ||
        collection === 'files' ||
        collection === 'filesMeta'
      ) {
        let updatedCollection;
        let index;
        switch (operation) {
          case 'create':
            updatedCollection = JSON.parse(JSON.stringify(this[collection]));
            index = updatedCollection.findIndex(compareIds);
            if (index === -1) {
              logger.publish(4, collection, `${collection}Created`, index);
              updatedCollection.push(instance);
              this[collection] = updatedCollection;
            }
            break;
          case 'update':
            updatedCollection = JSON.parse(JSON.stringify(this[collection]));
            index = updatedCollection.findIndex(compareIds);
            if (index > -1) {
              logger.publish(4, collection, `${collection}Updated`, index);
              updatedCollection[index] = instance;
              this[collection] = updatedCollection;
            }
            break;
          case 'delete':
            updatedCollection = JSON.parse(JSON.stringify(this[collection]));
            index = updatedCollection.findIndex(compareIds);
            if (index > -1) {
              logger.publish(4, collection, `${collection}Deleted`, index);
              updatedCollection.splice(index, 1);
              this[collection] = updatedCollection;
            }
            break;
          default:
            throw new Error('Wrong operation');
        }
      }
    },
  },
};

export default Collection;

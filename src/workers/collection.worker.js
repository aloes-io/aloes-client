/* Copyright 2020 Edouard Maleix, read LICENSE */

const collectionNames = ['device', 'sensor', 'files', 'filesMeta'];

const operations = ['create', 'update', 'delete'];

const updateCollectionProcess = (
  collectionName,
  collection,
  operation,
  instances,
  serialize = false,
) => {
  try {
    const compareIds = (source, instance) => {
      if (source && source.id && instance && instance.id) {
        return source.id.toString() === instance.id.toString();
      }
      return false;
    };

    const getCollectionIndex = (instance) => collection.findIndex((s) => compareIds(s, instance));

    const updateInstance = (instance) => {
      let index;
      switch (operation) {
        case 'create':
          index = getCollectionIndex(instance);
          if (index === -1) {
            collection.push(instance);
          } else {
            collection[index] = instance;
          }
          break;
        case 'update':
          index = getCollectionIndex(instance);
          if (index > -1) {
            collection[index] = instance;
          }
          break;
        case 'delete':
          index = getCollectionIndex(instance);
          if (index > -1) {
            collection.splice(index, 1);
          }
          break;
        default:
          return [];
      }
    };
    if (Array.isArray(instances)) instances.forEach(updateInstance);
    else updateInstance(instances);

    if (serialize) return JSON.parse(JSON.stringify(collection));
    return collection;
  } catch (e) {
    return [];
  }
};

function onMessage(event) {
  try {
    const args = Object.keys(event.data);
    const collectionName = event.data.collectionName;
    let collection = event.data.collection || [];
    // console.log('COLLECTION WORKER', collectionName, args, collection, event.data[args[3]]);
    if (collectionNames.includes(collectionName)) {
      const operation = event.data.operation;
      if (operations.includes(operation)) {
        const serialize = event.data.serialize || false;
        collection = updateCollectionProcess(
          collectionName,
          collection,
          operation,
          event.data[args[3]],
          serialize,
        );
        return postMessage({ collection });
      }
      return postMessage({ error: { message: 'Invalid operation' } });
    }
    return postMessage({ error: { message: 'Invalid collectionName' } });
  } catch (error) {
    return postMessage({ error: { message: error.message || 'An unknown error occured' } });
  }
}

onmessage = onMessage;

/* Copyright 2019 Edouard Maleix, read LICENSE */

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

    const getCollectionIndex = instance => collection.findIndex(s => compareIds(s, instance));

    const updateInstance = instance => {
      let index;
      switch (operation) {
        case 'create':
          index = getCollectionIndex(instance);
          if (index === -1) {
            // console.log(collectionName, `${collectionName}Created`, index);
            collection.push(instance);
          } else {
            // console.log(collectionName, `${collectionName}Updated`, index);
            collection[index] = instance;
          }
          break;
        case 'update':
          index = getCollectionIndex(instance);
          if (index > -1) {
            // console.log(collectionName, `${collectionName}Updated`, index);
            collection[index] = instance;
          }
          break;
        case 'delete':
          index = getCollectionIndex(instance);
          if (index > -1) {
            // console.log(collectionName, `${collectionName}Deleted`, index);
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
    if (
      collectionName === 'device' ||
      collectionName === 'sensor' ||
      collectionName === 'files' ||
      collectionName === 'filesMeta'
    ) {
      const operation = event.data.operation;
      if (operation === 'create' || operation === 'update' || operation === 'delete') {
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

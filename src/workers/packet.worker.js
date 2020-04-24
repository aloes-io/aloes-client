/* Copyright 2020 Edouard Maleix, read LICENSE */

import { aloesClientEncoder, aloesClientPatternDetector } from 'aloes-handlers';

function onMessage(event) {
  // console.log('PACKET WORKER MESSAGE : ', event.data);
  try {
    if (event.data && event.data.options) {
      const packet = aloesClientEncoder(event.data.options);
      return postMessage(packet);
    }
    if (event.data && event.data.topic) {
      const topic = event.data.topic;
      let payload = event.data.payload;
      try {
        if (typeof payload === 'string') {
          payload = JSON.parse(payload);
        } else if (typeof payload === 'object') {
          if (payload.type && payload.data) {
            payload = JSON.parse(Buffer.from(payload).toString());
          } else if (Buffer.isBuffer(payload)) {
            payload = JSON.parse(payload.toString());
          } else {
            JSON.parse(Buffer.from(payload.buffer).toString());
          }
        }
      } catch (e) {
        // empty
      }
      const pattern = aloesClientPatternDetector({ topic, payload });
      let method = pattern.params && pattern.params.method;
      let collection = pattern.params && pattern.params.collection;
      if (!method || !collection) throw new Error('Invalid protocol');
      method = method.toUpperCase();
      collection = collection.toLowerCase();
      return postMessage({ pattern, method, collection, topic, payload });
    }
    return postMessage({ error: { message: 'Invalid arguments' } });
  } catch (error) {
    return postMessage({ error: { message: error.message } });
  }
}

onmessage = onMessage;

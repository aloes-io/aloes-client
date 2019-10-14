import { updateAloesSensors } from 'aloes-handlers';

function onMessage(event) {
  try {
    // console.log('SENSOR WORKER MESSAGE : ', event.data);
    let sensor = event.data.sensor;
    if (sensor && sensor.id) {
      sensor = updateAloesSensors(sensor, event.data.resource, event.data.value);
      sensor.resource = event.data.resource;
      sensor.value = event.data.value;
      return postMessage({ sensor });
    }
    return postMessage({ error: { message: 'Invalid arguments' } });
  } catch (error) {
    return postMessage({ error: { message: error.message } });
  }
}

onmessage = onMessage;
// self.addEventListener('message', onMessage;

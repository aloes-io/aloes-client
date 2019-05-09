import mqtt from 'async-mqtt';
import logger from './logger';
import PubSub from './PubSub';

const brokerUrl = process.env.VUE_APP_BROKER_URL;
const baseOptions = {
  //  keepalive: 60,
  // reschedulePings: true,
  protocolId: 'MQTT',
  protocolVersion: 4,
  reconnectPeriod: 5000,
  connectTimeout: 30 * 1000,
  clean: true,
  clientId: null,
  username: null,
  password: null,
};

const socket = {};
let client;

socket.setToken = async token => {
  try {
    logger.publish(3, 'socket', 'setToken:req', token);
    socket.token = token;
    const options = {
      ...baseOptions,
      clientId: `${token.userId.toString()}-${Math.random()
        .toString(16)
        .substr(2, 8)}`,
      username: token.userId.toString(),
      password: token.id.toString(),
    };
    // if (client && client._client.connected) {
    //   client = mqtt.connect(brokerUrl, options);
    //   return socket;
    // }
    return socket.initSocket(options);
  } catch (error) {
    logger.publish(3, 'socket', 'setToken:err', error);
    return error;
  }
};

socket.removeToken = async () => {
  logger.publish(3, 'socket', 'removeToken:req', socket.token);
  // if (socket.client) {
  //   await PubSub.close(socket.client);
  //   await socket.client.end();
  // }
  delete socket.token;
  return null;
};

socket.initSocket = options => {
  logger.publish(3, 'socket', 'initSocket', options);
  client = mqtt.connect(brokerUrl, options);

  client.on('connect', async state => {
    if (client && client._client.connected) {
      await PubSub.setListeners(client, socket.token);
    }
    //  socket.client.publish(`${token.userId.toString()}/Authentication/POST`, "yooo");
    return null;
  });

  client.on('disconnect', async state => {
    logger.publish(3, 'socket', 'onDisconnect', state);
    await PubSub.close(client);
    return null;
  });

  client.on('message', async (topic, message) => {
    logger.publish(3, 'socket', 'onMessage', topic);
    await PubSub.handler(topic, message);
  });

  return socket;
};

export default socket;

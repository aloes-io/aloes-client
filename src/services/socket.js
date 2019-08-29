import mqtt from 'async-mqtt';
import logger from './logger';
import PubSub from './PubSub';

const Storage = window.sessionStorage;

const brokerUrl = process.env.VUE_APP_BROKER_URL;
const baseOptions = {
  //  keepalive: 60,
  // reschedulePings: true,
  protocolId: 'MQTT',
  protocolVersion: 4,
  reconnectPeriod: 5000,
  connectTimeout: 30 * 1000,
  // clean: true,
  clientId: null,
  username: null,
  password: null,
};

const socket = {};

const setSocketId = socketId => {
  if (Storage) {
    Storage.setItem('socket-id', socketId);
  }
};

const delSocketId = () => {
  if (Storage) {
    Storage.removeItem('socket-id');
  }
};

const getSocketId = () => {
  const socketId = Storage && Storage.getItem('socket-id');
  return socketId;
};

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
    // if (socket.client && socket.client._client.connected) {
    //   socket.client = mqtt.connect(brokerUrl, options);
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

  let socketId = getSocketId();
  if (socketId && socketId !== null && socket.client) {
    return null;
  }

  socket.client = mqtt.connect(brokerUrl, options);

  socket.client.on('connect', async state => {
    logger.publish(3, 'socket', 'onConnect', state);
    if (socket.client && socket.client._client.connected) {
      setSocketId(options.clientId);
      await PubSub.setListeners(socket.client, socket.token);
    }
    //  socket.client.publish(`${token.userId.toString()}/Authentication/POST`, "yooo");
    return null;
  });

  socket.client.on('offline', async state => {
    logger.publish(3, 'socket', 'onDisconnect', state);
    delSocketId();
    await PubSub.close(socket.client);
    return null;
  });

  socket.client.on('message', async (topic, message) => {
    logger.publish(3, 'socket', 'onMessage', topic);
    return PubSub.handler(topic, message);
  });

  return socket;
};

export default socket;

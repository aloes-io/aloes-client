import mqtt from 'async-mqtt';
import logger from './logger';
import PubSub from './PubSub';

const Storage = window.sessionStorage;

const brokerUrl = process.env.VUE_APP_BROKER_URL;
const baseOptions = {
  keepalive: 60,
  reschedulePings: true,
  protocolId: 'MQTT',
  protocolVersion: 4,
  reconnectPeriod: 1000,
  connectTimeout: 30 * 1000,
  clean: true,
  clientId: null,
  username: null,
  password: null,
  // will: { topic: `${clientId}/status`, payload: 'KO?', retain: false, qos: 0 },
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

socket.setToken = token => {
  try {
    logger.publish(3, 'socket', 'setToken:req', token);
    socket.token = token;
    const clientId = `${token.userId.toString()}-${Math.random()
      .toString(16)
      .substr(2, 8)}`;
    const options = {
      ...baseOptions,
      clientId,
      username: token.userId.toString(),
      password: token.id.toString(),
      // will: { topic: `${clientId}/status`, payload: 'KO?', retain: false, qos: 0 },
    };

    socket.initSocket(options);
  } catch (error) {
    logger.publish(3, 'socket', 'setToken:err', error);
  }
};

socket.removeToken = () => {
  try {
    logger.publish(3, 'socket', 'removeToken:req', socket.token);
    delSocketId();
    delete socket.token;
    if (socket.client) {
      PubSub.removeListeners(socket.client);
      socket.client.end();
    }
    logger.publish(3, 'socket', 'removeToken:res', 'success');
    // return;
  } catch (error) {
    logger.publish(3, 'socket', 'removeToken:err', error);
    // throw error;
  }
};

socket.initSocket = async options => {
  try {
    logger.publish(3, 'socket', 'initSocket:req', options);

    let socketId = getSocketId();
    if (socketId && socketId !== null && socket.client) {
      return socket;
    }
    socket.client = await mqtt.connectAsync(brokerUrl, options);
    logger.publish(3, 'socket', 'onConnect', 'success');

    // socket.client = mqtt.connect(brokerUrl, options);
    socket.client.on('connect', async state => {
      logger.publish(3, 'socket', 'onConnect', state);
      setSocketId(options.clientId);
    });

    setSocketId(options.clientId);
    await PubSub.setListeners(socket.client, socket.token);

    socket.client.on('offline', () => {
      logger.publish(3, 'socket', 'onDisconnect', '');
      delSocketId();
    });

    socket.client.on('message', PubSub.handler);

    return socket;
  } catch (error) {
    logger.publish(3, 'socket', 'initSocket:err', error);
    throw error;
  }
};

export default socket;

/* Copyright 2020 Edouard Maleix, read LICENSE */

import mqtt from 'async-mqtt';
import logger from './logger';
import PubSub from './PubSub';

const Storage = window.sessionStorage;
const brokerUrl = process.env.VUE_APP_BROKER_URL;
const socket = { failureCount: 0, maxFailureCount: 10 };

const baseOptions = {
  keepalive: 60,
  reschedulePings: true,
  protocolId: 'MQTT',
  protocolVersion: 4,
  reconnectPeriod: 2000,
  connectTimeout: 5 * 1000,
  clean: true,
  clientId: null,
  username: null,
  password: null,
};

const setSocketId = socketId => {
  if (Storage) Storage.setItem('socket-id', socketId);
};

const delSocketId = () => {
  if (Storage) Storage.removeItem('socket-id');
};

const getSocketId = () => Storage && Storage.getItem('socket-id');

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
      // socket.client.removeAllListeners('offline');
      PubSub.removeListeners(socket.client);
      socket.client.end(true);
      delete socket.client;
    }
    logger.publish(3, 'socket', 'removeToken:res', 'success');
  } catch (error) {
    logger.publish(3, 'socket', 'removeToken:err', error);
  }
};

const handleMessage = (packet, cb) => {
  PubSub.handler(packet.topic, packet.payload)
    .then(() => cb())
    .catch(() => cb());
};

socket.initSocket = async options => {
  try {
    logger.publish(3, 'socket', 'initSocket:req', options);
    let socketId = getSocketId();
    if (socketId && socketId !== null && socket.client) {
      return socket;
    }
    setSocketId(options.clientId);
    socket.client = await mqtt.connectAsync(brokerUrl, options);
    socket.failureCount = 0;
    logger.publish(3, 'socket', 'onConnect', 'success');
    // socket.client.setMaxListeners()
    await PubSub.setListeners(socket.client, socket.token);

    // socket.client.on('reconnect', () => {
    //   logger.publish(3, 'socket', 'onReconnecting', options.clientId);
    //   // setSocketId(options.clientId);
    // });

    socket.client.once('offline', () => {
      logger.publish(3, 'socket', 'onDisconnect', options.clientId);
      // delSocketId();
    });

    socket.client.handleMessage = handleMessage;

    return socket;
  } catch (error) {
    logger.publish(3, 'socket', 'initSocket:err', error);
    delSocketId();
    if (socket.failureCount < socket.maxFailureCount) {
      socket.failureCount += 1;
      return setTimeout(() => socket.initSocket(options), baseOptions.reconnectPeriod);
    }
    // delete socket.token;
    return null;
  }
};

export default socket;

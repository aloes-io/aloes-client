/* Copyright 2019 Edouard Maleix, read LICENSE */

import mqtt from 'async-mqtt';
import logger from './logger';
import PubSub from './PubSub';

const Storage = window.sessionStorage;
const brokerUrl = process.env.VUE_APP_BROKER_URL;
const socket = {};
const baseOptions = {
  keepalive: 60,
  reschedulePings: true,
  protocolId: 'MQTT',
  protocolVersion: 4,
  reconnectPeriod: 1000,
  connectTimeout: 2 * 1000,
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
      socket.client.end(true);
      PubSub.removeListeners(socket.client);
      delete socket.client;
    }
    logger.publish(3, 'socket', 'removeToken:res', 'success');
  } catch (error) {
    logger.publish(3, 'socket', 'removeToken:err', error);
  }
};

const handleMessage = (packet, cb) => {
  PubSub.handler(packet.topic, packet.payload)
    .then(() => {
      cb();
    })
    .catch(() => {
      cb();
    });
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
    setSocketId(options.clientId);
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
    throw error;
  }
};

export default socket;

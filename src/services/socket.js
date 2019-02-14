import mqtt from "async-mqtt";
import logger from "./logger";
import PubSub from "./PubSub";

const brokerUrl = process.env.VUE_APP_BROKER_URL;
const baseOptions = {
  //  keepalive: 60,
  // reschedulePings: true,
  protocolId: "MQTT",
  protocolVersion: 4,
  reconnectPeriod: 5000,
  connectTimeout: 30 * 1000,
  clean: true,
  clientId: null,
  username: null,
  password: null,
};

const socket = {};

socket.setToken = async (token) => {
  logger.publish(3, "socket", "setToken", token);
  socket.token = token;
  const options = {
    ...baseOptions,
    clientId: `${token.userId.toString()}-${Math.random()
      .toString(16)
      .substr(2, 8)}`,
    username: token.userId.toString(),
    password: token.id.toString(),
  };
  // if (socket.client && socket.client.connected) {
  //   await socket.client.end();
  // }
  return socket.initSocket(options);
};

socket.removeToken = async () => {
  logger.publish(3, "socket", "removeToken", socket.token);
  // if (socket.client) {
  //   await PubSub.close(socket.client);
  //   await socket.client.end();
  // }
  delete socket.token;
  return null;
};

socket.initSocket = (options) => {
  logger.publish(3, "socket", "initSocket", options);
  socket.client = mqtt.connect(brokerUrl, options);

  socket.client.on("connect", async (state) => {
    logger.publish(3, "socket", "onConnect", state);
    await PubSub.setListeners(socket.client, socket.token);
    //  socket.client.publish(`${token.userId.toString()}/Authentication/POST`, "yooo");
  });

  socket.client.on("disconnect", (state) => {
    logger.publish(3, "socket", "onDisconnect", state);
    //  PubSub.close(socket.client);
  });

  socket.client.on("message", async (topic, message) => {
    logger.publish(3, "socket", "onMessage", topic);
    await PubSub.handler(topic, message);
  });

  return socket;
};

export default socket;

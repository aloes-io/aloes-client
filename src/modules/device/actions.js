import loopback from "@/services/loopback";
import socket from "@/services/socket";
import PubSub from "@/services/PubSub";
import logger from "@/services/logger";

export async function findDevicesByAccount({ state, commit }, accountId) {
  return loopback
    .get(`/Accounts/${accountId}/${state.resources.toLowerCase()}`)
    .then(devices => {
      logger.publish(
        3,
        state.collectionName,
        "dispatch:findDevicesByAccount:res",
        devices
      );
      commit("setCollection", devices);
      return devices;
    })
    .catch(err => err);
}

export async function findDeviceById({ state, commit }, id) {
  return loopback
    .get(`/${state.resources}/${id}`)
    .then(device => {
      if (device.id) {
        logger.publish(
          2,
          state.collectionName,
          "dispatch:findDeviceById:res",
          device
        );
        commit("setModel", { viewer: false, device });
        return device;
      }
      const error = new Error("invalid device");
      return error;
    })
    .catch(err => err);
}

export async function findDeviceKV({ state, commit }, { key, value }) {
  // define limit base on acccount type ?
  try {
    const devices = await loopback.find(`/${state.resources}`, {
      where: { [key]: value },
      include: "sensors",
      limit: 10
    });
    commit("setCollection", devices);
    // devices.forEach((device) => {
    //   commit("setSensors", device.sensors);
    // });
    logger.publish(
      4,
      state.collectionName,
      "dispatch:findDeviceKV:res",
      devices
    );
    return devices;
  } catch (error) {
    await commit("setModelKV", { key: "error", value: error });
    logger.publish(2, state.collectionName, "dispatch:findDeviceKV:err", error);
    return error;
  }
}

export async function subscribeToDevicesUpdate({ state }, { userId }) {
  await state.collection.forEach(device => {
    return PubSub.subscribeToInstanceUpdate(
      socket.client,
      "Device",
      userId,
      device.id
    );
  });
}

export async function unsubscribeFromDevicesUpdate({ state }, { userId }) {
  await state.collection.forEach(device =>
    PubSub.unSubscribeWhere(socket.client, {
      collectionName: "Device",
      acccountId: userId,
      method: "PUT",
      modelId: device.id
    })
  );
}

export async function saveDevice({ dispatch }, { accountId, device }) {
  if (device.id) {
    return dispatch("updateDevice", { accountId, device });
  }
  return dispatch("createDevice", { accountId, device });
}

export async function createDevice({ state, commit }, { device }) {
  return (
    loopback
      //  .post(`/Accounts/${accountId}/${state.resources.toLowerCase()}`, device)
      .post(`/${state.resources.toLowerCase()}`, device)
      .then(res => {
        logger.publish(
          4,
          state.collectionName,
          "dispatch:createDevice:res",
          res
        );
        commit("setModel", res);
        return res;
      })
      .catch(err => err)
  );
  //  return result;
}

export async function updateDevice({ state, commit }, { device }) {
  return (
    loopback
      //  .put(`/Accounts/${accountId}/${state.resources.toLowerCase()}/${device.id}`, device)
      .put(`/${state.resources}/${device.id}`, device)
      .then(res => {
        logger.publish(
          3,
          state.collectionName,
          "dispatch:updateDevice:res",
          res
        );
        commit("setModel", res);
        return res;
      })
      .catch(err => err)
  );
  //  return result;
}

export async function delDevice({ state, commit }, { device }) {
  try {
    //  const deletedDevice = await loopback.delete(`/Accounts/${accountId}/${state.resources.toLowerCase()}/${device.id}`);
    const deletedDevice = await loopback.delete(
      `/${state.resources}/${device.id}`
    );
    await commit("setModelKV", {
      key: "success",
      value: { message: "device removed" }
    });
    return deletedDevice;
  } catch (error) {
    await commit("setModelKV", { key: "error", value: error });
    logger.publish(4, state.collectionName, "dispatch:delDevice:err", error);
    return error;
  }
}

export async function findSensorsByDevice({ state, commit }, deviceId) {
  return loopback
    .get(`${state.resources}/${deviceId}/sensors`)
    .then(sensors => {
      commit("setStateKV", { key: "sensors", value: sensors });
      //  logger.publish(3, state.collectionName, "dispatch:findSensorsByDevice:res", sensors);
      return sensors;
    })
    .catch(err => err);
}

export async function subscribeToSensorsUpdate({ state }, { userId }) {
  await state.sensors.forEach(sensor => {
    return PubSub.subscribeToInstanceUpdate(
      socket.client,
      "Sensor",
      userId,
      sensor.id
    );
  });
}

export async function unsubscribeFromSensorsUpdate({ state }, { userId }) {
  await state.sensors.forEach(sensor =>
    PubSub.unSubscribeWhere(socket.client, {
      collectionName: "Sensor",
      acccountId: userId,
      method: "PUT",
      modelId: sensor.id
    })
  );
}

export async function publishToSensor({ state }, { sensor, userId }) {
  return PubSub.publishToInstance(
    socket.client,
    "IoTAgent",
    userId,
    sensor.id,
    sensor
  );
}

export async function delSensor({ state, commit }, { deviceId, sensor }) {
  try {
    const deletedSensor = await loopback.delete(
      `/${state.resources}/${deviceId}/sensors/${sensor.id}`
    );
    await commit("setModelKV", {
      key: "success",
      value: { message: "sensor removed" }
    });
    return deletedSensor;
  } catch (error) {
    await commit("setModelKV", { key: "error", value: error });
    logger.publish(4, state.collectionName, "dispatch:delSensor:err", error);
    return error;
  }
}

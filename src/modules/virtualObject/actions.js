import loopback from "@/services/loopback";
import logger from "@/services/logger";

export async function findVirtualObjectByAccount({ state, commit }, accountId) {
  return loopback
    .get(`/Accounts/${accountId}/${state.resources.toLowerCase()}`)
    .then(devices => {
      logger.publish(
        3,
        state.collectionName,
        "dispatch:findVirtualObjectByAccount:res",
        devices
      );
      devices.forEach(devices => {
        commit("setCollection", devices);
        return devices;
      });
    })
    .catch(err => err);
}

export async function findVirtualObjectById({ state, commit }, id) {
  return loopback
    .get(`/${state.resources}/${id}`)
    .then(virtualObject => {
      if (virtualObject.id) {
        logger.publish(
          2,
          state.collectionName,
          "dispatch:findVirtualObjectById:res",
          virtualObject
        );
        commit("setModel", { viewer: false, virtualObject });
        return virtualObject;
      }
      const error = new Error("invalid virtualObject");
      return error;
    })
    .catch(err => err);
}

export async function findVirtualObjectKV({ state, commit }, { key, value }) {
  // define limit base on acccount type ?
  try {
    const virtualObjects = await loopback.find(`/${state.resources}`, {
      where: { [key]: value },
      //  include: "sensors",
      limit: 10
    });
    commit("setCollection", virtualObjects);
    // virtualObjects.forEach((virtualObject) => {
    //   commit("setSensors", virtualObject.sensors);
    // });
    logger.publish(
      4,
      state.collectionName,
      "dispatch:findVirtualObjectKV:res",
      virtualObjects
    );
    return virtualObjects;
  } catch (error) {
    await commit("setModelKV", { key: "error", value: error });
    logger.publish(
      2,
      state.collectionName,
      "dispatch:findVirtualObjectKV:err",
      error
    );
    return error;
  }
}

export async function saveVirtualObject(
  { dispatch },
  { accountId, virtualObject }
) {
  if (virtualObject.id) {
    return dispatch("updateVirtualObject", { accountId, virtualObject });
  }
  return dispatch("createVirtualObject", { accountId, virtualObject });
}

export async function createVirtualObject(
  { state, commit },
  { accountId, virtualObject }
) {
  return loopback
    .post(
      `/Accounts/${accountId}/${state.resources.toLowerCase()}`,
      virtualObject
    )
    .then(res => {
      logger.publish(
        4,
        state.collectionName,
        "dispatch:createVirtualObject:res",
        res
      );
      commit("setModel", res);
      return res;
    })
    .catch(err => err);
  //  return result;
}

export async function updateVirtualObject(
  { state, commit },
  { accountId, virtualObject }
) {
  return loopback
    .put(
      `/Accounts/${accountId}/${state.resources.toLowerCase()}/${
        virtualObject.id
      }`,
      virtualObject
    )
    .then(res => {
      logger.publish(
        3,
        state.collectionName,
        "dispatch:updateVirtualObject:res",
        res
      );
      commit("setModel", res);
      return res;
    })
    .catch(err => err);
  //  return result;
}

export async function delVirtualObject(
  { state, commit },
  { accountId, virtualObject }
) {
  try {
    const deletedVirtualObject = await loopback.delete(
      `/Accounts/${accountId}/${state.resources.toLowerCase()}/${
        virtualObject.id
      }`
    );
    await commit("setModelKV", {
      key: "success",
      value: { message: "virtualObject removed" }
    });
    return deletedVirtualObject;
  } catch (error) {
    await commit("setModelKV", { key: "error", value: error });
    logger.publish(
      4,
      state.collectionName,
      "dispatch:delVirtualObject:err",
      error
    );
    return error;
  }
}

import loopback from "@/services/loopback";
import logger from "@/services/logger";

export async function findAddress(
  { state, commit },
  { route, ownerId, viewer }
) {
  if (route === "device") {
    return loopback
      .get(`/Devices/${ownerId}/deviceAddress`)
      .then(address => {
        commit("setDeviceAddress", address);
        logger.publish(
          3,
          state.collectionName,
          "dispatch:findAddress:res",
          address
        );
        return address;
      })
      .catch(err => err);
  } else if (route === "account" || "profile") {
    return loopback
      .get(`/Accounts/${ownerId}/profileAddress`)
      .then(address => {
        logger.publish(
          3,
          state.collectionName,
          "dispatch:findAddress:res",
          address
        );
        commit("setProfileAddress", { viewer, address });
        return address;
      })
      .catch(err => err);
  }
}

export async function verifyAddress({ state, commit }, route) {
  let newAddress;
  if (route === "device") {
    newAddress = {
      street: state.deviceAddress.street,
      postalCode: state.deviceAddress.postalCode,
      city: state.deviceAddress.city,
      public: state.deviceAddress.public
    };
  } else if (route === "account") {
    newAddress = {
      street: state.profileAddress.street,
      postalCode: state.profileAddress.postalCode,
      city: state.profileAddress.city,
      public: state.profileAddress.public
    };
  }
  const address = await loopback
    .post(`/Accounts/verify-address`, { address: newAddress })
    .then(res => res.updatedAddress)
    .catch(err => err);

  if (address.message) {
    return address;
  }
  logger.publish(
    4,
    state.collectionName,
    "dispatch:verifyAddress:res",
    address
  );
  if (route === "device") {
    await commit("setDeviceAddress", address);
  } else {
    await commit("setProfileAddress", { viewer: false, address });
  }
  await commit("setModelKV", { route, key: "verified", value: true });
  return address;
}

export async function updateAddress({ state, commit }, { route, ownerId }) {
  // todo update device or profile address
  if (route === "device") {
    return loopback
      .put(`/Devices/${ownerId}/deviceAddress`, state.deviceAddress)
      .then(address => {
        commit("setDeviceAddress", address);
        logger.publish(
          3,
          state.collectionName,
          "dispatch:updateAddress:res",
          address
        );
        return address;
      })
      .catch(err => err);
  } else if (route === "account" || "profile") {
    return loopback
      .put(`/Accounts/${ownerId}/profileAddress`, state.profileAddress)
      .then(address => {
        commit("setProfileAddress", { viewer: false, address });
        logger.publish(
          3,
          state.collectionName,
          "dispatch:updateAddress:res",
          address
        );
        return address;
      })
      .catch(err => err);
  }
}

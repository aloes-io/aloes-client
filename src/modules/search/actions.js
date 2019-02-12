import loopback from "@/services/loopback";
import logger from "@/services/logger";

export async function searchProfiles({ state, commit }, filter) {
  if (!filter.profileType || !filter.accountType) {
    const error = new Error("Veuillez choisir un type de profils");
    await commit("setModelKV", { key: "error", value: error });
    return error;
  }
  logger.publish(
    4,
    state.collectionName,
    "dispatch:searchProfiles:req",
    filter
  );
  await commit("setModelKV", { key: "profileType", value: filter.profileType });
  const profiles = await loopback
    .post(`/${filter.accountType}s/text-search`, { filter })
    .then(res => res.result)
    .catch(err => {
      commit("setModelKV", { key: "error", value: err });
      return err;
    });
  if (profiles.length < 1) {
    const error = new Error("Aucun résultat ne correspond à votre recherche");
    await commit("setModelKV", { key: "error", value: error });
    return error;
  }
  await commit("setModelKV", { key: "success", value: profiles.length });
  await commit("setModelKV", { key: "results", value: profiles });
  return profiles;
}

export async function getProfilesByGeolocation({ state, commit }, filter) {
  if (!filter.profileType || !filter.accountType) {
    const error = new Error("Veuillez choisir un type de profils");
    await commit("setModelKV", { key: "error", value: error });
    return error;
  }
  logger.publish(
    4,
    state.collectionName,
    "dispatch:getProfilesByGeolocation:req",
    filter
  );
  await commit("setModelKV", { key: "profileType", value: filter.profileType });

  const profiles = await loopback
    .post(`/${filter.accountType}s/geo-locate`, { filter })
    .then(res => res.result)
    .catch(err => {
      commit("setModelKV", { key: "error", value: err });
      return err;
    });
  if (profiles.length === 0) {
    const error = new Error("Aucun résultat");
    await commit("setModelKV", { key: "error", value: error });
    return error;
  }
  commit("setModelKV", { key: "success", value: profiles.length });
  commit("setModelKV", { key: "results", value: profiles });
  return profiles;
}

export async function searchContacts({ state, commit }, filter) {
  if (!filter.profileType || !filter.accountType || !filter.accountId) {
    const error = new Error("Veuillez choisir un type de profils");
    await commit("setModelKV", { key: "error", value: error });
    return error;
  }
  logger.publish(
    4,
    state.collectionName,
    "dispatch:searchContacts:req",
    filter
  );
  const profiles = await loopback
    .post(`/${filter.accountType}s/search-contacts`, { filter })
    .then(res => res.result)
    .catch(err => {
      commit("setModelKV", { key: "error", value: err });
      return err;
    });
  if (profiles.length < 1) {
    const error = new Error("Aucun résultat ne correspond à votre recherche");
    await commit("setModelKV", { key: "error", value: error });
    return error;
  }
  await commit("setModelKV", { key: "success", value: profiles.length });
  return profiles;
}

export async function searchMessages({ state, commit }, filter) {
  if (!filter.profileType || !filter.accountType) {
    const error = new Error("Veuillez choisir un type de profils");
    await commit("setModelKV", { key: "error", value: error });
    return error;
  }
  logger.publish(
    4,
    state.collectionName,
    "dispatch:searchMessages:req",
    filter
  );
  const messages = await loopback
    .post(`/Messages/text-search`, { filter })
    .then(res => res.result)
    .catch(err => {
      commit("setModelKV", { key: "error", value: err });
      return err;
    });
  if (messages.length < 1) {
    const error = new Error("Aucun résultat ne correspond à votre recherche");
    await commit("setModelKV", { key: "error", value: error });
    return error;
  }
  await commit("setModelKV", { key: "success", value: messages.length });
  await commit("setModelKV", { key: "results", value: messages });
  return messages;
}

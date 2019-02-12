import logger from "@/services/logger";

export function setModelKV(state, { key, value }) {
  state[key] = value;
  logger.publish(5, state.collectionName, "commit:setModelKV:res", state[key]);
}

export function storeNotifications(state, { notifications, cmd, index }) {
  if (cmd === "add") {
    if (notifications && typeof notifications === typeof []) {
      state.rawNotifications.concat(notifications);
    } else if (notifications && typeof notifications === typeof {}) {
      state.rawNotifications.push(notifications);
    } else {
      // type error
      return null;
    }
  } else if (cmd === "update") {
    state.rawNotifications = notifications;
  } else if (cmd === "del" && index) {
    state.rawNotifications[index].splice(notifications, 1);
  }
  return state.rawNotifications;
}

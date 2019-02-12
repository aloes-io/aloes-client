import moment from "moment";
import loopback from "@/services/loopback";
import logger from "@/services/logger";

function durationFilter(key, start, end) {
  let maxStart, maxEnd;
  if (!start) {
    maxStart = {
      [key]: {
        gte: `${moment()
          .subtract(1, "months")
          .toDate()}`
      }
    };
  } else {
    maxStart = { [key]: { gte: `${start}` } };
  }
  if (!end) {
    maxEnd = {
      [key]: {
        lte: `${moment().toDate()}`
      }
    };
  } else {
    maxEnd = { [key]: { lte: `${end}` } };
  }
  const filter = { maxStart, maxEnd };
  return filter;
}

export async function delNotification({ state, commit }, notification) {
  try {
    const deletedNotification = await loopback.delete(
      `Accounts/${notification.accountId}/notifications/${notification.id}`
    );
    const updatedNotifications = state.rawNotifications.filter(
      notif => notif.id !== notification.id
    );
    await commit("setModelKV", {
      key: "rawNotifications",
      value: updatedNotifications
    });

    return deletedNotification;
  } catch (error) {
    await commit("setModelKV", { key: "error", value: error });
    logger.publish(
      4,
      state.collectionName,
      "dispatch:delNotification:err",
      error
    );
    return error;
  }
}

export async function updateNotification({ state }, notification) {
  try {
    if (!notification.isRead) {
      notification.isRead = true;
    }
    const updatedNotification = await loopback.post(
      `Accounts/${notification.accountId}/${state.resources}/${
        notification.id
      }`,
      notification
    );
    logger.publish(
      4,
      state.collectionName,
      "dispatch:updateNotification:res",
      updatedNotification
    );
    return updatedNotification;
  } catch (error) {
    logger.publish(
      4,
      state.collectionName,
      "dispatch:updateNotification:err",
      error
    );
    return error;
  }
}

export async function sortNotifications({ commit }, notifications) {
  try {
    const sortedNotifications = notifications.sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    let senderIds = sortedNotifications.map(notif => notif.from.accountId);
    senderIds = senderIds.filter(
      (senderId, index, inputArray) => inputArray.indexOf(senderId) === index
    );
    //  console.log('sortNotifications', senderIds);
    const sortedByProfile = senderIds.map(senderId => {
      const events = sortedNotifications.filter(
        notification => notification.from.accountId === senderId
      );
      const from = sortedNotifications.find(
        notif => notif.from.accountId === senderId
      );
      const sortedNotification = { senderId, events, from: from.from };
      return sortedNotification;
    });

    await commit("setModelKV", {
      key: "sortedNotifications",
      value: sortedByProfile
    });
    // await commit('storeNotifications', {
    //   notifications: sortedNotifications,
    //   cmd: 'update',
    // });
    return sortedByProfile;
  } catch (error) {
    return error;
  }
}

export async function loadNotifications(
  { state, commit, dispatch },
  { userId, start, end }
) {
  try {
    const timeFilter = await durationFilter("date", start, end);
    const rawNotifications = await loopback.find(
      `/Accounts/${userId}/${state.resources.toLowerCase()}`,
      {
        where: {
          and: [timeFilter.maxStart, timeFilter.maxEnd]
        }
      }
    );
    await commit("setModelKV", {
      key: "rawNotifications",
      value: rawNotifications
    });
    await commit("setModelKV", {
      key: "unread",
      value: rawNotifications.length
    });
    return dispatch("sortNotifications", rawNotifications);
  } catch (error) {
    await commit("setModelKV", { key: "error", value: error });
    logger.publish(
      4,
      state.collectionName,
      "dispatch:loadNotifications:err",
      error
    );
    return error;
  }
}

import * as actions from "./actions";
import * as mutations from "./mutations";

export default {
  namespaced: true,
  state: {
    collectionName: "Notification",
    resources: "Notifications",
    rawNotifications: [],
    sortedNotifications: [],
    unread: 0,
    count: 0,
    showNotifications: false,
    notification: {
      senderId: null,
      receiverId: null,
      subject: null,
      content: null,
      from: {
        name: null,
        accountId: null,
        profileId: null,
        profileAvatar: null,
        profileType: null
      },
      to: {
        name: null,
        accountId: null,
        profileId: null,
        profileAvatar: null,
        profileType: null
      }
    }
  },
  mutations,
  actions
};

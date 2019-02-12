import * as actions from "./actions";
import * as mutations from "./mutations";

export default {
  namespaced: true,
  state: {
    collectionName: "Scheduler",
    resources: "Schedulers",
    editorMode: false,
    model: [],
    viewed: [],
    scheduler: {
      title: "",
      type: null,
      start: null,
      end: null,
      allDay: false,
      dow: [],
      moy: [],
      repeat: 0,
      recurStart: null,
      recurEnd: null,
      color: "",
      className: ""
    }
  },
  mutations,
  actions
};

import * as actions from "./actions";
import * as mutations from "./mutations";

export default {
  namespaced: true,
  state: {
    collectionName: "Search",
    resources: "Searches",
    filter: null,
    model: {
      profileType: null,
      location: null,
      yogaStyle: null,
      certifiedYA: null,
      statusFilter: false,
      expressFilter: false,
      favoriteFilter: false,
      profileSelected: null,
      appointment: {
        type: null,
        yogaStyle: null,
        start: "",
        end: "",
        allDay: false,
        dow: [],
        moy: [],
        repeat: 0,
        recurStart: "",
        recurEnd: ""
      },
      results: [],
      success: null,
      error: null
    }
  },
  mutations,
  actions
};

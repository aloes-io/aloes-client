import logger from "@/services/logger";

export function setModelKV(state, { key, value }) {
  state.model[key] = value;
  logger.publish(
    4,
    state.collectionName,
    "commit:setModelKV:res",
    state.model[key]
  );
}

export function setModelList(state, { command, list, value }) {
  if (command === "add") {
    state.model[list].push(value);
  } else if (command === "del") {
    state.model[list].splice(value, 1);
  } else if (command === "update") {
    state.model[list] = value;
  }
  logger.publish(
    4,
    state.collectionName,
    "commit:setModelList:res",
    state.model[list]
  );
}

export function setAppointmentKV(state, { key, value }) {
  state.model.appointment[key] = value;
  logger.publish(
    4,
    state.collectionName,
    "commit:setAppointmentKV:res",
    state.model.appointment
  );
}

export function cleanSearch(state) {
  const model = {
    profileType: null,
    location: null,
    yogaStyle: null,
    certifiedYA: null,
    statusFilter: false,
    expressFilter: false,
    favoriteFilter: false,
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
  };
  state.model = model;
  logger.publish(
    4,
    state.collectionName,
    "commit:cleanSearch:res",
    state.model
  );
}

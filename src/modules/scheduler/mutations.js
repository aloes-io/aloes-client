import logger from "@/services/logger";

export function setScheduler(state, scheduler) {
  state.scheduler = scheduler;
  logger.publish(
    4,
    state.collectionName,
    "commit:setScheduler:res",
    state.scheduler
  );
}

export function setSchedulerKV(state, { key, value }) {
  state.scheduler[key] = value;
  logger.publish(
    4,
    state.collectionName,
    "commit:setSchedulerKV:res",
    state.scheduler
  );
}

export function cleanSchedulerModel(state) {
  state.scheduler = {
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
  };
  logger.publish(
    4,
    state.collectionName,
    "commit:cleanSchedulerModel:res",
    state.scheduler
  );
}

export function setSchedulers(state, { schedulers, viewer }) {
  if (viewer) {
    state.viewer.schedulers = schedulers;
    logger.publish(
      4,
      state.collectionName,
      "commit:setSchedulers:res",
      state.viewer.schedulers
    );
  } else {
    state.model = schedulers;
    logger.publish(
      4,
      state.collectionName,
      "commit:setSchedulers:res",
      state.model
    );
  }
}

export function addScheduler(state, scheduler) {
  state.model.push(scheduler);
  logger.publish(
    4,
    state.collectionName,
    "commit:addScheduler:res",
    state.model
  );
}

export function updateScheduler(state, { oldScheduler, newScheduler }) {
  const index = state.model.indexOf(oldScheduler);
  if (index !== -1) {
    state.model.splice(index, 1, newScheduler);
  }
  logger.publish(4, state.collectionName, "commit:updateScheduler:res", {
    index,
    newScheduler
  });
}

export function deleteScheduler(state, scheduler) {
  while (state.model.indexOf(scheduler) !== -1) {
    state.model.splice(state.model.indexOf(scheduler), 1);
  }
  logger.publish(
    4,
    state.collectionName,
    "commit:deleteScheduler:res",
    state.model
  );
}

export function cleanSchedulersModel(state) {
  state.model = [];
  logger.publish(
    4,
    state.collectionName,
    "commit:cleanSchedulersModel:res",
    state.model
  );
}

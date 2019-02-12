import loopback from "@/services/loopback";
import logger from "@/services/logger";

export async function loadSchedulers({ state }, profileId) {
  return loopback
    .get(`/Accounts/${profileId}/${state.resources}`)
    .then(res => {
      logger.publish(
        3,
        state.collectionName,
        "dispatch:loadSchedulers:res",
        res
      );
      return res;
    })
    .catch(err => err);
}

export async function loadSchedulersByPeriod(
  { state, commit },
  { profileId, start, end, viewer }
) {
  const result = await loopback
    .find(`/Accounts/${profileId}/${state.resources}`, {
      where: {
        or: [
          {
            and: [
              { recurStart: { lte: `${start.format()}` } },
              { recurEnd: { gte: `${start.format()}` } },
              { recurEnd: { lte: `${end.format()}` } }
            ]
          },
          {
            and: [
              { recurStart: { gte: `${start.format()}` } },
              { recurEnd: { lte: `${end.format()}` } }
            ]
          },
          {
            and: [
              { recurStart: { gte: `${start.format()}` } },
              { recurStart: { lte: `${end.format()}` } },
              { recurEnd: { gte: `${end.format()}` } }
            ]
          },
          {
            and: [
              { recurStart: { lte: `${start.format()}` } },
              { recurEnd: { gte: `${end.format()}` } }
            ]
          }
        ]
      }
    })
    .catch(err => err);
  logger.publish(
    2,
    state.collectionName,
    "dispatch:loadSchedulersByPeriod:res",
    result
  );
  await commit("setSchedulers", { result, viewer });
  return result;
}

export async function createScheduler(
  { state, commit },
  { account, scheduler }
) {
  let result = {};
  scheduler.accountId = account.id;
  await loopback
    .post(`/Accounts/${account.id}/${state.resources}`, scheduler)
    .then(res => {
      logger.publish(
        3,
        state.collectionName,
        "dispatch:createScheduler:res",
        res
      );
      result = res;
    })
    .catch(err => err);
  await commit("addScheduler", result);
  return result;
}

export async function updateScheduler({ state, commit }, scheduler) {
  let newScheduler;
  await loopback
    .put(
      `/Accounts/${scheduler.accountId}/${state.resources}/${scheduler.id}`,
      scheduler
    )
    .then(res => {
      newScheduler = res;
    })
    .catch(err => err);
  const oldScheduler = state.schedulers.find(appt => appt.id === scheduler.id);
  if (!newScheduler || !oldScheduler) {
    throw new Error("no scheduler to update");
  }
  await logger.publish(
    3,
    state.collectionName,
    "dispatch:updateTeacherAppointment:res",
    {
      newScheduler,
      oldScheduler
    }
  );
  await commit("updateScheduler", { oldScheduler, newScheduler });
  return newScheduler;
}

export async function deleteScheduler(
  { state, commit },
  { accountId, schedulerId }
) {
  await loopback
    .delete(`/Accounts/${accountId}/${state.resources}/${schedulerId}`)
    .catch(err => err);
  const oldScheduler = state.schedulers.find(appt => appt.id === schedulerId);
  await logger.publish(
    3,
    state.collectionName,
    "dispatch:deleteScheduler:res",
    oldScheduler
  );
  await commit("deleteScheduler", oldScheduler);
  return oldScheduler;
}

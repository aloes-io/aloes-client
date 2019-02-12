import loopback from "@/services/loopback";
import socket from "@/services/socket";
import logger from "@/services/logger";

/**
 * Sync loopback token with current state
 */
export function syncToken({ commit, dispatch }) {
  if (loopback.token) {
    commit("setAccessToken", loopback.token);
    socket.setToken(loopback.token);
    return dispatch("loadAccount", loopback.token.userId).catch(err => {
      commit("setAccessToken", null);
      socket.removeToken();
      return err;
    });
  }
  return Promise.resolve();
}

function evaluateRoute(state, to, from, next) {
  return sessionError => {
    if (to.matched.some(record => record.meta.requiresAuth)) {
      logger.publish(4, "Router", "evaluateRoute:res", "1");
      if (
        (to.name === "account" ||
          to.name === "device" ||
          to.name === "search" ||
          to.name === "register") &&
        to.query.token &&
        to.query.userId &&
        (state.access_token || loopback.token)
      ) {
        logger.publish(4, "Router", "evaluateRoute:res", "1a");
        next();
      } else if (to.matched.some(record => record.meta.requiresPaid)) {
        logger.publish(4, "Router", "evaluateRoute:res", "1b");
        if (
          (to.name === "messenger" ||
            to.name === "team" ||
            to.name === "profile") &&
          state.access_token
        ) {
          logger.publish(4, "Router", "evaluateRoute:res", "1b1");
          if (state.account.subscribed === "paid") {
            logger.publish(4, "Router", "evaluateRoute:res", "1b1a");
            next();
          } else if (
            state.account.subscribed === "free" ||
            state.account.subscribed === "new"
          ) {
            logger.publish(4, "Router", "evaluateRoute:res", "1b1b");
            next({
              name: "register",
              query: {
                token: state.access_token.id,
                userId: state.access_token.userId,
                subscribeType: state.account.subscribed,
                switchSubscribeType: "paid"
              }
            });
          } else {
            logger.publish(4, "Router", "evaluateRoute:res", "1b1c");
            next({
              name: "home",
              params: {
                sessionError
              }
            });
          }
        } else {
          logger.publish(4, "Router", "evaluateRoute:res", "1b2");
          next({
            name: "home",
            params: {
              sessionError
            }
          });
        }
      } else if (!state.access_token || !loopback.token) {
        logger.publish(4, "Router", "evaluateRoute:res", "1c");
        next({
          name: "login",
          params: {
            sessionError
          }
        });
      } else {
        logger.publish(4, "Router", "evaluateRoute:res", "1d");
        //  next();
        next({
          name: "login",
          params: {
            sessionError
          }
        });
      }
    } else {
      logger.publish(4, "Router", "evaluateRoute:res", "2");
      next();
    }
  };
}

/**
 * Sync router for auth
 */
export function syncRouter({ state, dispatch }, myRouter) {
  myRouter.beforeEach((to, from, next) => {
    dispatch("syncToken").then(evaluateRoute(state, to, from, next));
  });
}

export async function verifyCaptcha({ state }, token) {
  const hashes = state.hashes;
  return loopback
    .post(`/${state.resources}/verify-captcha`, { hashes, token })
    .then(res => res.result.success)
    .catch(err => err);
}

export async function signUp(
  { state },
  { type, email, password, firstName, lastName }
) {
  const result = await loopback
    .post(`/${state.resources}`, {
      type,
      email,
      password,
      firstName,
      lastName
    })
    .then(res => res)
    .catch(err => err);
  if (!result) {
    return null;
  }
  logger.publish(3, state.collectionName, "dispatch:signUp:res", result);
  return result;
}

export async function signIn(
  { state, commit, dispatch },
  { email, password, save }
) {
  try {
    const accessToken = await loopback.post(`/${state.resources}/login`, {
      email,
      password
    });
    await commit("setAccessToken", accessToken);
    if (state.access_token !== null) {
      loopback.setToken(state.access_token, save);
    } else {
      loopback.removeToken();
    }
    logger.publish(3, state.collectionName, "dispatch:signIn:res", accessToken);
    await dispatch("loadAccount", state.access_token.userId);
    return accessToken;
  } catch (error) {
    logger.publish(3, state.collectionName, "dispatch:signIn:err", error);
    throw error;
  }
}

export async function findAccountByEmail({ state }, email) {
  try {
    logger.publish(
      3,
      state.collectionName,
      "dispatch:findAccountByEmail:req",
      email
    );
    const res = await loopback.post(`/${state.resources}/find-by-email`, {
      email
    });
    logger.publish(
      3,
      state.collectionName,
      "dispatch:findAccountByEmail:res",
      res
    );
    if (res.result && res.result.email) {
      logger.publish(
        3,
        state.collectionName,
        "dispatch:findAccountByEmail:res",
        res.result.email
      );
      if (res.result.email.accepted && res.result.email.accepted[0] === email)
        return true;
      //  if (res.result.email.rejected === [`${email}`]) return false; // please try again
      return false;
    }
    return false;
  } catch (error) {
    logger.publish(
      3,
      state.collectionName,
      "dispatch:findAccountByEmail:err",
      error
    );
    return error;
  }
}

export async function verifyEmail({ state }, account) {
  try {
    logger.publish(
      3,
      state.collectionName,
      "dispatch:verifyEmail:req",
      account
    );
    const result = await loopback.post(
      `/${state.resources}/verify-email`,
      account
    );
    logger.publish(3, state.collectionName, "dispatch:verifyEmail:res", result);
    if (result && result.email && result.email.accepted[0] === account.email)
      return true;
    return false;
  } catch (error) {
    logger.publish(3, state.collectionName, "dispatch:verifyEmail:err", error);
    return error;
  }
}

export function changePassword(ctx, { oldPassword, newPassword }) {
  return loopback.post(`/${ctx.state.resources}/change-password`, {
    oldPassword,
    newPassword
  });
}

export function rememberPassword(ctx, email) {
  return loopback.post(`/${ctx.state.resources}/reset`, { email });
}

export function updatePasswordFromToken(ctx, { accessToken, newPassword }) {
  logger.publish(
    4,
    ctx.state.collectionName,
    "dispatch:updatePasswordFromToken:req",
    accessToken
  );
  return loopback.post(`/${ctx.state.resources}/update-password-from-token`, {
    accessToken,
    newPassword
  });
}

export async function signOut({ commit, state }) {
  //  let response;
  await loopback.post(`/${state.resources}/logout`, {
    // eslint-disable-next-line dot-notation
    accessToken: state["access_token"]
  });
  await loopback.removeToken();
  await socket.removeToken();
  await commit("setAccount", { viewer: false, account: null });
  return null;
}

export async function loadAccount({ state, commit }, userId) {
  return loopback
    .get(`/${state.resources}/${userId}`)
    .then(account => {
      commit("setAccount", { viewer: false, account });
    })
    .catch(err => {
      loopback.removeToken();
      return err;
    });
}

export async function findAccountById(
  { state, commit },
  { accountId, viewer }
) {
  return loopback
    .get(`/${state.resources}/${accountId}`)
    .then(account => {
      logger.publish(
        3,
        state.collectionName,
        "dispatch:findAccountById:res",
        account
      );
      commit("setAccount", { viewer, account });
      return account;
    })
    .catch(err => err);
}

export async function updateAccount({ commit, state }, account) {
  return loopback
    .patch(`/${state.resources}/${account.id}`, account)
    .then(res => {
      logger.publish(
        3,
        state.collectionName,
        "dispatch:updateAccount:res",
        res
      );
      commit("setAccount", { viewer: false, account });
      return res;
    })
    .catch(err => err);
  //  return result;
}

export async function subscribePlan({ state }, subscribeType) {
  const account = state.account;
  const result = await loopback
    .post(`/${state.resources}/subscribe-plan`, {
      account,
      subscribeType
    })
    .then(res => res.subscription)
    .catch(err => {
      logger.publish(
        2,
        state.collectionName,
        "dispatch:subscribePlan:err",
        err
      );
      return err;
    });
  logger.publish(3, state.collectionName, "dispatch:subscribePlan:res", result);
  return result;
}

export async function sendUnscribeReasons({ state }, { account, reasons }) {
  const response = await loopback
    .post(`/${state.resources}/send-unsubscribe-reasons`, { account, reasons })
    .catch(err => err);
  logger.publish(
    4,
    state.collectionName,
    "dispatch:sendUnscribeReasons:res",
    response
  );
  return response;
}

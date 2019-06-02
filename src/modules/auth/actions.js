import loopback from '@/services/loopback';
import socket from '@/services/socket';
import logger from '@/services/logger';

let Cookie = document.cookie;

function getCookie(cname) {
  const name = cname + '=';
  const decodedCookie = decodeURIComponent(Cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}

function deleteCookie(name) {
  //  Cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  Cookie = `${name}=; Path=/; Domain=.${
    process.env.VUE_APP_DOMAIN
  }; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
}

function importTokenFromCookies() {
  if (Cookie) {
    return {
      id: getCookie('access_token'),
      userId: getCookie('userId'),
    };
  }
  return '';
}

/**
 * Sync loopback token with current state
 */
export function syncToken({ commit, dispatch }) {
  if (loopback.token) {
    commit('setAccessToken', loopback.token);
    socket.setToken(loopback.token);
    return dispatch('loadAccount', loopback.token.userId).catch(err => {
      commit('setAccessToken', null);
      socket.removeToken();
      return err;
    });
  }
  // else if (importTokenFromCookies()) {
  //   const token = importTokenFromCookies();
  //   console.log('syncToken', token);
  //   commit('setAccessToken', token);
  //   loopback.setToken(token);
  // }
  return Promise.resolve();
}

function evaluateRoute(state, to, from, next) {
  return sessionError => {
    if (to.matched.some(record => record.meta.requiresAuth)) {
      logger.publish(4, 'Router', 'evaluateRoute:res', '1');
      if (
        (to.name === 'account' ||
          to.name === 'device' ||
          to.name === 'application' ||
          to.name === 'search') &&
        to.query['access-token'] &&
        to.query['user-id'] &&
        (state.access_token || loopback.token || getCookie('access_token'))
        //  (state.access_token || loopback.token)
      ) {
        logger.publish(4, 'Router', 'evaluateRoute:res', '1a');
        next();
      } else if (to.matched.some(record => record.meta.requiresPaid)) {
        logger.publish(4, 'Router', 'evaluateRoute:res', '1b');
        if (
          (to.name === 'messenger' || to.name === 'team' || to.name === 'profile') &&
          state.access_token
        ) {
          logger.publish(4, 'Router', 'evaluateRoute:res', '1b1');
          if (state.account.subscribed === 'paid') {
            logger.publish(4, 'Router', 'evaluateRoute:res', '1b1a');
            next();
          } else if (state.account.subscribed === 'free' || state.account.subscribed === 'new') {
            logger.publish(4, 'Router', 'evaluateRoute:res', '1b1b');
            next({
              name: 'register',
              query: {
                token: state.access_token.id,
                userId: state.access_token.userId,
                subscribeType: state.account.subscribed,
                switchSubscribeType: 'paid',
              },
            });
          } else {
            logger.publish(4, 'Router', 'evaluateRoute:res', '1b1c');
            next({
              name: 'home',
              params: {
                sessionError,
              },
            });
          }
        } else {
          logger.publish(4, 'Router', 'evaluateRoute:res', '1b2');
          next({
            name: 'home',
            params: {
              sessionError,
            },
          });
        }
      } else if (!state.access_token && !loopback.token && !getCookie('access_token')) {
        logger.publish(4, 'Router', 'evaluateRoute:res', '1c');
        next({
          name: 'login',
          params: {
            sessionError,
          },
        });
      } else {
        logger.publish(4, 'Router', 'evaluateRoute:res', '1d');
        //  next();
        next({
          name: 'login',
          params: {
            sessionError,
          },
        });
      }
    } else {
      logger.publish(4, 'Router', 'evaluateRoute:res', '2');
      next();
    }
  };
}

/**
 * Sync router for auth
 */
export function syncRouter({ state, dispatch }, myRouter) {
  myRouter.beforeEach((to, from, next) => {
    dispatch('syncToken').then(evaluateRoute(state, to, from, next));
  });
}

export async function verifyCaptcha({ state }, token) {
  const hashes = state.hashes;
  return loopback
    .post(`/${state.resources}/verify-captcha`, { hashes, token })
    .then(res => res.result.success)
    .catch(err => err);
}

export async function signUp({ state }, { type, email, password, firstName, lastName }) {
  const result = await loopback
    .post(`/${state.resources}`, {
      type,
      email,
      password,
      firstName,
      lastName,
    })
    .then(res => res)
    .catch(err => err);
  if (!result) {
    return null;
  }
  logger.publish(3, state.collectionName, 'dispatch:signUp:res', result);
  return result;
}

export async function signIn({ state, commit, dispatch }, { email, password, save }) {
  try {
    //  const accessToken = await loopback.post(`/auth/login`, {
    const accessToken = await loopback.post(`/${state.resources}/login`, {
      email,
      password,
    });
    if (!accessToken || accessToken === null || accessToken instanceof Error) {
      throw new Error('Invalid token');
    }
    await commit('setAccessToken', accessToken);
    if (state.access_token !== null) {
      loopback.setToken(state.access_token, save);
    } else {
      loopback.removeToken();
    }
    logger.publish(3, state.collectionName, 'dispatch:signIn:res', accessToken);
    await dispatch('loadAccount', state.access_token.userId);
    return accessToken;
  } catch (error) {
    logger.publish(3, state.collectionName, 'dispatch:signIn:err', error);
    throw error;
  }
}

export async function externalSignIn({ state, commit }, save) {
  try {
    //  const accessToken = await loopback.get(`${state.authRoute}/${provider}`);
    const accessToken = await importTokenFromCookies();
    await commit('setAccessToken', accessToken);
    // if (state.access_token !== null) {
    //   loopback.setToken(state.access_token, save);
    // } else {
    //   return loopback.removeToken();
    // }
    logger.publish(3, state.collectionName, 'dispatch:externalSignIn:res', accessToken);
    return accessToken;
  } catch (error) {
    logger.publish(3, state.collectionName, 'dispatch:externalSignIn:err', error);
    throw error;
  }
}

export async function findAccountByEmail({ state }, email) {
  try {
    logger.publish(3, state.collectionName, 'dispatch:findAccountByEmail:req', email);
    const res = await loopback.post(`/${state.resources}/find-by-email`, {
      email,
    });
    logger.publish(3, state.collectionName, 'dispatch:findAccountByEmail:res', res);
    if (res.result && res.result.email) {
      logger.publish(3, state.collectionName, 'dispatch:findAccountByEmail:res', res.result.email);
      if (res.result.email.accepted && res.result.email.accepted[0] === email) return true;
      //  if (res.result.email.rejected === [`${email}`]) return false; // please try again
      return false;
    }
    return false;
  } catch (error) {
    logger.publish(3, state.collectionName, 'dispatch:findAccountByEmail:err', error);
    return error;
  }
}

export async function verifyEmail({ state }, user) {
  try {
    logger.publish(3, state.collectionName, 'dispatch:verifyEmail:req', user);
    const result = await loopback.post(`/${state.resources}/verify-email`, user);
    logger.publish(3, state.collectionName, 'dispatch:verifyEmail:res', result);
    if (result && result.email && result.email.accepted[0] === user.email) {
      return true;
    }
    return false;
  } catch (error) {
    logger.publish(3, state.collectionName, 'dispatch:verifyEmail:err', error);
    return error;
  }
}

export async function changePassword({ state }, { oldPassword, newPassword }) {
  try {
    const res = await loopback.post(`/${state.resources}/set-new-password`, {
      oldPassword,
      newPassword,
    });
    logger.publish(3, state.collectionName, 'dispatch:changePassword:res', res);
  } catch (error) {
    logger.publish(2, state.collectionName, 'dispatch:changePassword:err', error);
    return error;
  }
}

export function rememberPassword(ctx, email) {
  return loopback.post(`/${ctx.state.resources}/reset`, { email });
}

export function updatePasswordFromToken(ctx, { accessToken, newPassword }) {
  logger.publish(4, ctx.state.collectionName, 'dispatch:updatePasswordFromToken:req', accessToken);
  return loopback.post(`/${ctx.state.resources}/update-password-from-token`, {
    accessToken,
    newPassword,
  });
}

export async function signOut({ commit, state }) {
  await loopback.post(`/${state.resources}/logout`, {
    // eslint-disable-next-line dot-notation
    accessToken: state['access_token'],
  });
  await loopback.removeToken();
  await socket.removeToken();
  await commit('setAccount', { viewer: false, account: null });
  return null;
}

export async function externalSignOut({ commit, state }) {
  await loopback.get(`/${state.authRoute}/logout`);
  await loopback.removeToken();
  await socket.removeToken();
  deleteCookie('access_token');
  deleteCookie('userId');
  await commit('setAccessToken', null);
  await commit('setAccount', { viewer: false, account: null });
  return null;
}

export async function loadFullAccount({ state, commit }, accountId) {
  // return loopback
  //   .get(`/Accounts/${accountId}/${state.resources.toLowerCase()}`)
  return loopback
    .find(`/${state.resources}`, {
      where: { accountId },
      //  include: 'profileAddress',
      include: 'address',
      limit: 1,
    })
    .then(account => {
      logger.publish(3, state.collectionName, 'dispatch:loadFullAccount:res', account);
      commit('setAccount', { viewer: false, account });
      return account;
    })
    .catch(err => {
      loopback.removeToken();
      return err;
    });
}

export async function loadAccount({ state, commit }, userId) {
  return loopback
    .get(`/${state.resources}/${userId}`)
    .then(account => {
      commit('setAccount', { viewer: false, account });
    })
    .catch(err => {
      loopback.removeToken();
      return err;
    });
}

export async function findAccountById({ state, commit }, { userId, viewer }) {
  return loopback
    .get(`/${state.resources}/${userId}`)
    .then(account => {
      logger.publish(3, state.collectionName, 'dispatch:findAccountById:res', account);
      commit('setAccount', { viewer, account });
      return account;
    })
    .catch(err => err);
}

export async function updateAccount({ commit, state }, user) {
  return loopback
    .patch(`/${state.resources}/${user.id}`, user)
    .then(res => {
      logger.publish(3, state.collectionName, 'dispatch:updateAccount:res', res);
      commit('setAccount', { viewer: false, account: user });
      return res;
    })
    .catch(err => err);
  //  return result;
}

export async function subscribePlan({ state }, subscribeType) {
  const user = state.account;
  const result = await loopback
    .post(`/${state.resources}/subscribe-plan`, {
      user,
      subscribeType,
    })
    .then(res => res.subscription)
    .catch(err => {
      logger.publish(2, state.collectionName, 'dispatch:subscribePlan:err', err);
      return err;
    });
  logger.publish(3, state.collectionName, 'dispatch:subscribePlan:res', result);
  return result;
}

export async function sendUnscribeReasons({ state }, { user, reasons }) {
  const response = await loopback
    .post(`/${state.resources}/send-unsubscribe-reasons`, { user, reasons })
    .catch(err => err);
  logger.publish(4, state.collectionName, 'dispatch:sendUnscribeReasons:res', response);
  return response;
}

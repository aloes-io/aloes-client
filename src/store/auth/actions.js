/* Copyright 2020 Edouard Maleix, read LICENSE */

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
  Cookie = `${name}=; Path=/; Domain=.${window.settings.VUE_APP_DOMAIN}; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
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
    return dispatch('loadAccount', loopback.token.userId);
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
  //   await store.restored
  return sessionError => {
    if (to.matched.some(record => record.meta.requiresAuth)) {
      logger.publish(4, 'Router', 'evaluateRoute:res', '1');
      if (
        (to.name === 'account' ||
          to.name === 'device' ||
          to.name === 'application' ||
          to.name === 'team' ||
          to.name === 'profile' ||
          to.name === 'search') &&
        to.query['access-token'] &&
        to.query['user-id'] &&
        (state.access_token || getCookie('access_token'))
        //  (state.access_token || loopback.token)
      ) {
        logger.publish(4, 'Router', 'evaluateRoute:res', '1a');
        next();
      } else if (!state.access_token && !getCookie('access_token')) {
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
export function syncRouter({ state, dispatch }, router) {
  router.beforeEach((to, from, next) => {
    dispatch('syncToken').then(evaluateRoute(state, to, from, next));
  });
}

export async function signUp({ state }, { email, password, firstName, lastName }) {
  try {
    const result = await loopback.post(`/${state.resources}`, {
      email,
      password,
      firstName,
      lastName,
    });

    logger.publish(3, state.collectionName, 'dispatch:signUp:res', result);
    return result;
  } catch (error) {
    logger.publish(3, state.collectionName, 'dispatch:signUp:err', error);
    throw error;
  }
}

export async function loadAccount({ state, commit }, userId) {
  try {
    const account = await loopback.get(`/${state.resources}/${userId}`);
    commit('setAccount', { viewer: false, account });
    socket.setToken(state.access_token);
    return account;
  } catch (error) {
    loopback.removeToken();
    socket.removeToken();
    commit('setAccount', { viewer: false, account: null });
    throw error;
  }
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

export async function signIn({ state, commit, dispatch }, { email, password, save }) {
  try {
    //  const accessToken = await loopback.post(`/auth/login`, {
    const accessToken = await loopback.post(`/${state.resources}/login`, {
      email,
      password,
    });
    logger.publish(3, state.collectionName, 'dispatch:signIn:res', accessToken);
    if (!accessToken || accessToken === null || accessToken instanceof Error) {
      throw new Error('Invalid token');
    }
    commit('setAccessToken', accessToken);
    if (state.access_token !== null) {
      loopback.setToken(state.access_token, save);
    } else {
      loopback.removeToken();
    }
    await dispatch('loadAccount', state.access_token.userId);
    return accessToken;
  } catch (error) {
    logger.publish(3, state.collectionName, 'dispatch:signIn:err', error);
    throw error;
  }
}

export async function externalSignIn({ state, commit }, save = true) {
  try {
    //  const accessToken = await loopback.get(`${state.authRoute}/${provider}`);
    const accessToken = await importTokenFromCookies();
    commit('setAccessToken', accessToken);
    if (save) {
      // if (state.access_token !== null) {
      //   loopback.setToken(state.access_token, save);
      // } else {
      //   return loopback.removeToken();
      // }
    }
    logger.publish(3, state.collectionName, 'dispatch:externalSignIn:res', accessToken);
    return accessToken;
  } catch (error) {
    logger.publish(3, state.collectionName, 'dispatch:externalSignIn:err', error);
    throw error;
  }
}

export async function signOut({ commit, state }) {
  try {
    await loopback.post(`/${state.resources}/logout`, {
      // eslint-disable-next-line dot-notation
      accessToken: state['access_token'],
    });
    loopback.removeToken();
    socket.removeToken();
    commit('setAccount', { viewer: false, account: null });
    return;
  } catch (error) {
    loopback.removeToken();
    // socket.removeToken();
    commit('setAccount', { viewer: false, account: null });
    return;
  }
}

export async function externalSignOut({ commit, state }) {
  try {
    await loopback.get(`/${state.authRoute}/logout`);
    loopback.removeToken();
    socket.removeToken();
    deleteCookie('access_token');
    deleteCookie('userId');
    commit('setAccessToken', null);
    commit('setAccount', { viewer: false, account: null });
    return;
  } catch (error) {
    deleteCookie('access_token');
    deleteCookie('userId');
    commit('setAccessToken', null);
    commit('setAccount', { viewer: false, account: null });
    return;
  }
}

export async function findAccountByEmail({ state }, email) {
  try {
    logger.publish(3, state.collectionName, 'dispatch:findAccountByEmail:req', email);
    const res = await loopback.post(`/${state.resources}/find-by-email`, {
      email,
    });
    logger.publish(3, state.collectionName, 'dispatch:findAccountByEmail:res', res);
    if (res && res.email) {
      logger.publish(3, state.collectionName, 'dispatch:findAccountByEmail:res', res.email);
      if (res.email.accepted && res.email.accepted[0] === email) {
        return true;
      }
      //  if (res.result.email.rejected === [`${email}`]) return false; // please try again
      return false;
    }
    return false;
  } catch (error) {
    logger.publish(3, state.collectionName, 'dispatch:findAccountByEmail:err', error);
    throw error;
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
    throw error;
  }
}

export async function changePassword({ state }, { oldPassword, newPassword }) {
  try {
    const res = await loopback.post(`/${state.resources}/set-new-password`, {
      oldPassword,
      newPassword,
    });
    logger.publish(3, state.collectionName, 'dispatch:changePassword:res', res);
    return res;
  } catch (error) {
    logger.publish(2, state.collectionName, 'dispatch:changePassword:err', error);
    throw error;
  }
}

export async function rememberPassword(ctx, email) {
  return loopback.post(`/${ctx.state.resources}/reset`, { email });
}

export async function updatePasswordFromToken(ctx, { accessToken, newPassword }) {
  logger.publish(4, ctx.state.collectionName, 'dispatch:updatePasswordFromToken:req', accessToken);
  return loopback.post(`/${ctx.state.resources}/update-password-from-token`, {
    accessToken,
    newPassword,
  });
}

export async function updateAccount({ commit, state }, user) {
  return loopback
    .patch(`/${state.resources}/${user.id}`, user)
    .then(res => {
      logger.publish(3, state.collectionName, 'dispatch:updateAccount:res', res);
      commit('setAccount', { viewer: false, account: res });
      return res;
    })
    .catch(err => err);
}

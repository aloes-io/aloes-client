import logger from '@/services/logger';

export function setAccessToken(state, token) {
  // eslint-disable-next-line camelcase
  state.access_token = token;
  logger.publish(4, state.collectionName, 'commit:setAccessToken:res', state.access_token);
}

export function setAccountList(state, { command, list, value }) {
  if (command === 'add') {
    state.account[list].push(value);
  } else if (command === 'del') {
    state.account[list].splice(value, 1);
  } else if (command === 'update') {
    state.account[list] = value;
  }
  logger.publish(4, state.collectionName, `commit:setModelList:${command}`, state.account[list]);
}

export function setModelKV(state, { key, value }) {
  state.account[key] = value;
  logger.publish(4, state.collectionName, 'commit:setModelKV:res', state.account[key]);
}

export function setEditorMode(state, value) {
  state.editorMode = value;
  logger.publish(4, state.collectionName, 'commit:setEditorMode:res', state.editorMode);
}

export function setAccount(state, { account, viewer }) {
  if (viewer) {
    state.viewed = account;
    logger.publish(4, state.collectionName, 'commit:setViewedModel:res', state.viewed);
  } else {
    state.account = account;
    logger.publish(4, state.collectionName, 'commit:setAccount:res', state.account);
  }
}

export function setCredentialsKV(state, { key, value }) {
  state.signup[key] = value;
  logger.publish(4, state.collectionName, 'commit:setCredentialsKV:res', state.signup[key]);
}

export function setEmail(state, email) {
  state.account.email = email;
  logger.publish(4, state.collectionName, 'commit:setEmail:res', state.account.email);
}

export function setAccountType(state, accountType) {
  state.accountType = accountType;
  logger.publish(4, state.collectionName, 'commit:setAccountType:res', state.accountType);
}

export function setLogin(state, value) {
  state.login = value;
  logger.publish(4, state.collectionName, 'commit:setLogin:res', state.login);
}

export function setLoginKV(state, { key, value }) {
  state.login[key] = value;
  logger.publish(4, state.collectionName, 'commit:setLoginKV:res', state.login[key]);
}

export function cleanLogin(state) {
  state.login = {
    email: null,
    password: '',
    save: true,
    dismissSecs: 4,
    dismissCountDown: 0,
    error: null,
    loading: false,
  };
  logger.publish(4, state.collectionName, 'commit:cleanLogin:res', state.login);
}

export function cleanSignup(state) {
  state.signup = {
    accountType: null,
    accountTypes: [{ text: 'Professeur', value: 'Teacher' }, { text: 'Studio', value: 'Studio' }],
    confirmPassword: '',
    checked: [],
    verified: false,
    signedUp: false,
    show: true,
    error: null,
    loading: false,
  };
  logger.publish(4, state.collectionName, 'commit:cleanLogin:res', state.signup);
}

export function setViewer(state, value) {
  state.isViewer = value;
  logger.publish(4, state.collectionName, 'commit:setViewer:res', state.isViewer);
}

export function setForgotPassword(state, value) {
  state.forgotPassword = value;
  logger.publish(4, state.collectionName, 'commit:setForgotPassword:res', state.forgotPassword);
}

export function setForgotPasswordKV(state, { key, value }) {
  state.forgotPassword[key] = value;
  logger.publish(
    4,
    state.collectionName,
    'commit:setForgotPasswordKV:res',
    state.forgotPassword[key],
  );
}

export function cleanForgotPassword(state) {
  state.forgotPassword = {
    error: null,
    success: null,
    email: null,
    loading: false,
  };
  logger.publish(4, state.collectionName, 'commit:cleanForgotPassword:res', state.forgotPassword);
}

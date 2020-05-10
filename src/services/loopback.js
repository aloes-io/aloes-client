/* Copyright 2020 Edouard Maleix, read LICENSE */

import axios from 'axios';
import logger from './logger';

// const Storage = window.localStorage;
const Storage = window.sessionStorage;
const serverUrl = window.settings.VUE_APP_SERVER_URL;
const restApiRoot = `${window.settings.VUE_APP_ROOT_API}`;

const exportTokenToLocalStorage = (token) => {
  if (Storage) Storage.setItem('loopback-token', JSON.stringify(token));
};

const removeTokenFromLocalStorage = () => {
  if (Storage) Storage.removeItem('loopback-token');
};

const addTokenFromLocalStorage = (http) => {
  const token = Storage && Storage.getItem('loopback-token');
  if (token) {
    http.setToken(JSON.parse(token), false);
  }
};

const http = axios.create({
  baseURL: `${serverUrl}${restApiRoot}`,
});

// Current setLoading function
let setLoading = () => {
  logger.publish(2, 'loopback', 'setLoadingFunction', 'undefined');
};

http.setLoadingFunction = (fn) => {
  setLoading = fn;
};

http.setToken = (token, save = true) => {
  http.token = token;
  http.defaults.headers.common.Authorization = token.id;
  if (save) exportTokenToLocalStorage(token);
};

http.removeToken = () => {
  delete http.token;
  delete http.defaults.headers.common.Authorization;
  return removeTokenFromLocalStorage();
};

http.find = (endpoint, filter) => http.get(endpoint, { params: { filter } });

const interceptResErrors = (err) => {
  try {
    logger.publish(2, 'loopback', 'listener:interceptResErrors', err);
    setLoading(false, err.config.uid || err.response.config.uid);
    err = Object.assign(new Error(), err.response.data.error);
  } catch (e) {
    // Will return err if something goes wrong
  }
  return Promise.reject(err);
};
const interceptResponse = (res) => {
  logger.publish(5, 'loopback', 'listener:interceptResponse', res);
  setLoading(false, res.config.uid);
  try {
    return res.data;
  } catch (e) {
    return res;
  }
};

http.interceptors.response.use(interceptResponse, interceptResErrors);

// Set storage Token in http if exists
addTokenFromLocalStorage(http);

const interceptReqErrors = (err) => Promise.reject(err);

const interceptRequest = (config) => {
  config.uid = setLoading(true, config.uid);
  logger.publish(5, 'loopback', 'listener:interceptRequest', config);
  return config;
};

http.interceptors.request.use(interceptRequest, interceptReqErrors);

export default http;

/* Copyright 2020 Edouard Maleix, read LICENSE */

import logger from '@/services/logger';

export function setModelKV(state, { key, value }) {
  state.instance[key] = value;
  // logger.publish(
  //   4,
  //   state.collectionName,
  //   "commit:setModelKV:res",
  //   state.instance[key]
  // );
}

export function setModel(state, application) {
  state.instance = application;
  logger.publish(4, state.collectionName, 'commit:setModel:res', state.instance);
}

export function setCollection(state, applications) {
  state.collection = applications;
  // logger.publish(
  //   4,
  //   state.collectionName,
  //   "commit:setCollection:res",
  //   state.collection
  // );
}

export function setStateKV(state, { key, value }) {
  state[key] = value;
  logger.publish(4, state.collectionName, 'commit:setStateKV:res', state[key]);
}

export function setEditorMode(state, value) {
  state.editorMode = value;
  logger.publish(4, state.collectionName, 'commit:setEditorMode:res', state.editorMode);
}

export function cleanModel(state) {
  state.instance = {
    userId: null,
    name: null,
    icon: '/icons/image-placeholder.png',
    description: null,
    accessPointUrl: null,
    transportProtocol: null,
    transportProtocolVersion: null,
    appEui: null,
    apiKey: null,
    pattern: null,
    validators: {},
    public: false,
  };
  state.sensors = [];
  logger.publish(4, state.collectionName, 'commit:cleanModel:res', state.instance);
}

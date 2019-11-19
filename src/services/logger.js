/* Copyright 2019 Edouard Maleix, read LICENSE */

import tiza from 'tiza';

const logger = {};
// const remoteLog = false;

const formatLog = (collectionName, command, content) => {
  let fullContent;
  const maxLineSize = 250;
  if (typeof content === 'object') {
    if (content instanceof Error) {
      // fullContent = content;
      // const code = content.code || content.statusCode;
      fullContent = `[${collectionName.toUpperCase()}] ${command} : ${content.message} `;
    } else {
      fullContent = `[${collectionName.toUpperCase()}] ${command} : ${JSON.stringify(content)}`;
    }
  } else if (typeof content !== 'object') {
    fullContent = `[${collectionName.toUpperCase()}] ${command} : ${content}`;
  }
  if (typeof fullContent === 'string' && fullContent.length > maxLineSize) {
    fullContent = `${fullContent.substring(0, maxLineSize - 3)} ...`;
  }
  return fullContent;
};

const sendFormatedLog = (collectionName, command, fullContent) => {
  switch (collectionName.toUpperCase()) {
    case 'PUBSUB':
      tiza
        .color('#fff')
        .bgColor('#8ac8a3')
        .text(fullContent)
        .log();
      break;
    case 'LOOPBACK':
      tiza
        .color('#686868')
        .bgColor('#8ac8a3')
        .text(fullContent)
        .log();
      break;
    case 'ACCOUNT':
      tiza
        .color('#8ac8a3')
        .bgColor('#fff')
        .text(fullContent)
        .log();
      break;
    case 'DEVICE':
      tiza
        .color('#7ebcaf')
        .bgColor('#fff')
        .text(fullContent)
        .log();
      break;
    case 'SENSOR':
      tiza
        .color('#528fa2')
        .bgColor('#fff')
        .text(fullContent)
        .log();
      break;
    case 'FILES':
      tiza
        .color('#444b4e')
        .bgColor('#fff')
        .text(fullContent)
        .log();
      break;
    default:
      tiza
        .color('#686868')
        .bgColor('#fff')
        .text(fullContent)
        .log();
  }
};

logger.publish = (priority, collectionName, command, content) => {
  const logLevel = Number(process.env.VUE_APP_LOGGER_LEVEL) || 4;

  if (priority <= logLevel) {
    const fullContent = formatLog(collectionName, command, content);
    sendFormatedLog(collectionName, command, fullContent);
    // if (remoteLog === true) {
    //   // pubsub.publish(loopback, {
    //   //   accountId: 0,
    //   //   collectionName,
    //   //   data: content,
    //   //   method: 'POST',
    //   // });
    // }
    return fullContent;
  } else if (priority > logLevel) {
    return null;
  }
  return null;
};

export default logger;

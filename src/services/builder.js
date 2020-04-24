import crypto from 'crypto';

const builder = {};

builder.generateKeys = (howMany, chars) => {
  chars = chars || 'abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789';
  const rnd = crypto.randomBytes(howMany);
  const value = new Array(howMany);
  const len = Math.min(256, chars.length);
  const d = 256 / len;
  for (let i = 0; i < howMany; i++) {
    value[i] = chars[Math.floor(rnd[i] / d)];
  }
  return value
    .join('')
    .toString()
    .toUpperCase();
};

export default builder;

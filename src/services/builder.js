//  import moment from 'moment';
import crypto from 'crypto';

const builder = {};

builder.generateKeys = async (howMany, chars) => {
  try {
    chars = chars || 'abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789';
    const rnd = await crypto.randomBytes(howMany);
    const value = new Array(howMany);
    const len = Math.min(256, chars.length);
    const d = 256 / len;
    for (let i = 0; i < howMany; i++) {
      value[i] = chars[Math.floor(rnd[i] / d)];
    }
    const key = value
      .join('')
      .toString()
      .toUpperCase();
    return key;
  } catch (error) {
    return error;
  }
};

export default builder;

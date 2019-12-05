import logger from '@/services/logger';

export default {
  methods: {
    notifySuccess(res) {
      if (res !== undefined) {
        return logger.publish(3, 'Notify', 'SUCCESS', res);
      }
      return logger.publish(3, 'Notify', 'SUCCESS', '');
    },
    notifyError(error) {
      if (error !== null) {
        logger.publish(3, 'Notify', 'ERROR', error);
        throw error;
      }
      const err = { error: '[ERROR] unknow error' };
      throw err;
    },
  },
};

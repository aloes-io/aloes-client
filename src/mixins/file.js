import logger from '@/services/logger';
import FileWorker from '@/workers/file.worker.js';

const File = {
  mounted() {
    this.fileWorker = new FileWorker();
  },
  beforeDestroy() {
    this.fileWorker.terminate();
  },
  methods: {
    getUrl(blob) {
      return new Promise((resolve, reject) => {
        if (!blob) reject(new Error('Invalid arguments'));
        // this.fileWorker2 = new FileWorker();
        const onMessage = e => {
          // this.fileWorker2.terminate();
          if (e.data.error) reject(new Error(e.data.error.message));
          const url = e.data.url || null;
          if (!url || url === null) reject(new Error('Invalid url'));
          resolve(url);
        };
        // this.fileWorker2.addEventListener('message', onMessage);
        this.fileWorker.onmessage = onMessage;
        this.fileWorker.onerror = reject;
        this.fileWorker.postMessage({ blob });
      });
    },

    getBlob(value) {
      return new Promise((resolve, reject) => {
        if (!value) reject(new Error('Invalid arguments'));
        // this.fileWorker = new FileWorker();
        const onMessage = e => {
          // this.fileWorker.terminate();
          if (e.data.error) reject(new Error(e.data.error.message));
          const blob = e.data.blob || null;
          if (!blob || blob === null) reject(new Error('Invalid blob'));
          resolve(blob);
        };
        this.fileWorker.onmessage = onMessage;
        this.fileWorker.onerror = reject;
        this.fileWorker.postMessage({ value });
      });
    },

    async parseImage(value) {
      try {
        logger.publish(4, 'file', 'parseImage:req', typeof value, value instanceof Blob);
        let blob;
        if (value instanceof Blob) {
          blob = value;
        } else {
          blob = await this.getBlob(value);
        }
        const url = await this.getUrl(blob);
        // console.log('file', 'parseImage:res', url);
        return url;
      } catch (error) {
        logger.publish(3, 'file', 'parseImage:err', error);
        throw error;
      }
    },
  },
};

export default File;

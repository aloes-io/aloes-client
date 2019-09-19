import logger from '@/services/logger';

const File = {
  methods: {
    getImageUrl(blob) {
      return new Promise((resolve, reject) => {
        const fReader = new FileReader();
        fReader.onload = () => {
          if (!fReader.result) reject(new Error('no result from file reader'));
          resolve(fReader.result);
        };
        fReader.readAsDataURL(blob);
      });
    },

    async parseImage(value) {
      try {
        logger.publish(5, 'file', 'parseImage:req', typeof value);
        if (value && typeof value === 'string') {
          const base64Flag = `data:image/png;base64,`;
          const blob = (await fetch(`${base64Flag}${value}`)).blob();
          return this.getImageUrl(blob);
        } else if (value.type && value.type === 'Buffer') {
          const blob = new Blob([Buffer.from(value.data).buffer]);
          return this.getImageUrl(blob);
        } else if (value instanceof Blob) {
          return this.getImageUrl(value);
        } else if (value instanceof ArrayBuffer) {
          const blob = new Blob([value.buffer]);
          return this.getImageUrl(blob);
        }
        return null;
      } catch (error) {
        throw error;
      }
    },
  },
};

export default File;

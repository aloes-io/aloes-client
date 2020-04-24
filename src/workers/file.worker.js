/* Copyright 2020 Edouard Maleix, read LICENSE */

const getImageUrlProcess = blob =>
  new Promise((resolve, reject) => {
    const fReader = new FileReader();
    fReader.onload = () => {
      if (!fReader.result) return reject(new Error('no result from file reader'));
      return resolve(fReader.result);
    };
    fReader.onerror = e => {
      reject(e);
    };
    fReader.readAsDataURL(blob);
  });

const parseImageProcess = value => {
  try {
    if (value && typeof value === 'string') {
      const base64Flag = `data:image/png;base64,`;
      return fetch(`${base64Flag}${value}`)
        .then(res => res.blob())
        .catch(e => e);
    } else if (value.type && value.type === 'Buffer') {
      return new Blob([Buffer.from(value.data).buffer]);
    } else if (value instanceof Blob) {
      return value;
    } else if (value instanceof ArrayBuffer) {
      return new Blob([value.buffer]);
    }

    return null;
  } catch (error) {
    return null;
  }
};

async function onMessage(event) {
  try {
    // console.log('FILE WORKER MESSAGE : ', event.data);
    if (event.data && event.data.value) {
      const blob = await parseImageProcess(event.data.value);
      return postMessage({ blob });
    }
    if (event.data && event.data.blob) {
      const url = await getImageUrlProcess(event.data.blob);
      return postMessage({ url });
    }
    return postMessage({ error: { message: 'Invalid arguments' } });
  } catch (error) {
    // console.log('FILE WORKER ERROR : ', error);
    return postMessage({ error: { message: error.message } });
  }
}

onmessage = onMessage;

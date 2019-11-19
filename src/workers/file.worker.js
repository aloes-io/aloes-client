/* Copyright 2019 Edouard Maleix, read LICENSE */

const getImageUrlProcess = blob => {
  return new Promise((resolve, reject) => {
    const fReader = new FileReader();
    fReader.onload = () => {
      if (!fReader.result) reject(new Error('no result from file reader'));
      resolve(fReader.result);
    };
    fReader.onerror = e => {
      reject(e);
    };
    fReader.readAsDataURL(blob);
  });
};

const parseImageProcess = value => {
  try {
    let blob = null;
    if (value && typeof value === 'string') {
      // console.log('parseImageProcess : string');
      const base64Flag = `data:image/png;base64,`;
      return fetch(`${base64Flag}${value}`)
        .then(res => res.blob())
        .catch(e => e);
    } else if (value.type && value.type === 'Buffer') {
      // console.log('parseImageProcess : JSON buffer');
      blob = new Blob([Buffer.from(value.data).buffer]);
    } else if (value instanceof Blob) {
      // console.log('parseImageProcess : blob');
      blob = value;
    } else if (value instanceof ArrayBuffer) {
      // console.log('parseImageProcess : ArrayBuffer');
      blob = new Blob([value.buffer]);
    } else {
      // console.log('parseImageProcess : unknown : ', value);
    }
    return blob;
  } catch (error) {
    return null;
  }
};

async function onMessage(event) {
  try {
    // console.log('FILE WORKER MESSAGE : ', event.data);
    if (event.data && event.data.value) {
      const blob = parseImageProcess(event.data.value);
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
// self.addEventListener('message', onMessage);

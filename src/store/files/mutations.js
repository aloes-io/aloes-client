/* Copyright 2019 Edouard Maleix, read LICENSE */

// Uploading audio and image files

export function setUploadedFile(state, { resourceType, role, file }) {
  if (resourceType && resourceType !== null) {
    if (role && role !== null) {
      state[resourceType][role].file = file;
    } else {
      state[resourceType].file = file;
    }
  }
  //  console.log("setUploadedFile : ", state.fileModel[resourceType][role].file)
}

export function setUploadedFileUrl(state, { resourceType, role, url }) {
  switch (resourceType) {
    case 'Audios':
      state.Audios[role].url.pop();
      state.Audios[role].url.push(`${state.serverUrl}${url}`);
      //  console.log(`setUploadedFileUrl (Audios) : ${state[resourceType][role].url}`);
      break;
    case 'Images':
      state[resourceType][role].url = `${state.serverUrl}${url}`;
      //  console.log(`setUploadedFileUrl (Images) : ${state[resourceType][role].url}`);
      break;
    case 'Document':
      state[resourceType][role].url = `${state.serverUrl}${url}`;
      //  console.log(`setUploadedFileUrl (Images) : ${state[resourceType][role].url}`);
      break;
    case 'Binaries':
      state.Binaries.url = url;
      break;
    default:
      null;
    //console.log("setUploadedFileUrl error : unknown resourceType");
  }
}

export function setUploadedFileName(state, { resourceType, role, name }) {
  if (resourceType && resourceType !== null) {
    if (role && role !== null) {
      state[resourceType][role].name = name;
    } else {
      state[resourceType].name = name;
    }
  }
  //  console.log("setUploadedFileName : ", state.fileModel[resourceType][role].name)
}

export function setUploadStatus(state, { resourceType, role, status }) {
  if (resourceType && resourceType !== null) {
    if (role && role !== null) {
      state[resourceType][role].status = status;
    } else {
      state[resourceType].status = status;
    }
  }
  //  console.log('setUploadStatus : ', state[resourceType][role].status);
}

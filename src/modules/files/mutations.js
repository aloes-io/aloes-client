// Uploading audio and image files

export function setUploadedFile(state, { resourceType, role, file }) {
  state[resourceType][role].file = file;
  //  console.log("setUploadedFile : ", state.fileModel[resourceType][role].file)
}

export function setUploadedFileUrl(state, { resourceType, role, url }) {
  switch (resourceType) {
    case "Audios":
      state.Audios[role].url.pop();
      state.Audios[role].url.push(`${state.serverUrl}${url}`);
      //  console.log(`setUploadedFileUrl (Audios) : ${state[resourceType][role].url}`);
      break;
    case "Images":
      state[resourceType][role].url = `${state.serverUrl}${url}`;
      //  console.log(`setUploadedFileUrl (Images) : ${state[resourceType][role].url}`);
      break;
    case "Document":
      state[resourceType][role].url = `${state.serverUrl}${url}`;
      //  console.log(`setUploadedFileUrl (Images) : ${state[resourceType][role].url}`);
      break;
    default:
      null;
    //console.log("setUploadedFileUrl error : unknown resourceType");
  }
}

export function setUploadedFileName(state, { resourceType, role, name }) {
  state[resourceType][role].name = name;
  //  console.log("setUploadedFileName : ", state.fileModel[resourceType][role].name)
}

export function setUploadStatus(state, { resourceType, role, status }) {
  state[resourceType][role].status = status;
  //  console.log('setUploadStatus : ', state[resourceType][role].status);
}

import { FileUploadService } from "v-file-upload";
import logger from "@/services/logger";

// Uploading audio and image files
export async function onResetFileImport(
  { state, commit },
  { resourceType, role }
) {
  logger.publish(4, state.collectionName, "dispatch:onResetFileImport:req", {
    resourceType,
    role
  });
  await commit("setUploadedFile", {
    resourceType,
    role,
    file: []
  });
  return commit("setUploadStatus", {
    resourceType,
    role,
    status: state.STATUS_INITIAL
  });
}

export async function onUploadSuccess(
  { state, commit },
  { resourceType, role, res }
) {
  logger.publish(
    4,
    state.collectionName,
    "dispatch:onUploadSuccess:res",
    res.target.response
  );
  await commit("setUploadedFileUrl", {
    resourceType,
    role,
    url: `${res.target.response.url}`
  });
  await commit("setUploadStatus", {
    resourceType,
    role,
    status: state.STATUS_SUCCESS
  });
  return res.target.response;
}

export function onUploadProgress(event) {
  logger.publish(4, "files", "onUploadProgress:res", event);
}

export async function onUploadError(
  { state, commit },
  { resourceType, role, err }
) {
  logger.publish(2, state.collectionName, "dispatch:onUploadError:err", err);
  await commit("setUploadStatus", {
    resourceType,
    role,
    status: state.STATUS_FAILED
  });
  return err;
}

export async function onFileImport(
  { state, commit, dispatch },
  { accessToken, resourceType, role, files }
) {
  logger.publish(4, state.collectionName, "dispatch:onFileImport:req", role);
  await commit("setUploadStatus", {
    resourceType,
    role,
    status: state.STATUS_SAVING
  });

  const fileUpload = new FileUploadService(
    `${process.env.VUE_APP_SERVER_URL}${process.env.VUE_APP_ROOT_API}/files/${
      accessToken.userId
    }/upload`,
    {
      "access-token": accessToken.id,
      authorization: accessToken.id
      //  "Access-Control-Allow-Origin": ["*"]
    },
    onUploadProgress
  );

  return fileUpload
    .upload(files)
    .then(res => dispatch("onUploadSuccess", { resourceType, role, res }))
    .catch(err => dispatch("onUploadError", { resourceType, role, err }));
}

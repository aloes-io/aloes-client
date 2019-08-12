import { FileUploadService } from 'v-file-upload';
import loopback from '@/services/loopback';
import logger from '@/services/logger';

// Uploading audio and image files
export async function onResetFileImport({ state, commit }, { resourceType, role }) {
  logger.publish(4, state.collectionName, 'dispatch:onResetFileImport:req', {
    resourceType,
    role,
  });
  await commit('setUploadedFile', {
    resourceType,
    role,
    file: [],
  });
  return commit('setUploadStatus', {
    resourceType,
    role,
    status: state.STATUS_INITIAL,
  });
}

export async function onUploadSuccess({ state, commit }, { resourceType, role, res }) {
  logger.publish(4, state.collectionName, 'dispatch:onUploadSuccess:res', res);
  await commit('setUploadedFileUrl', {
    resourceType,
    role,
    url: `${res.url}`,
  });
  await commit('setUploadStatus', {
    resourceType,
    role,
    status: state.STATUS_SUCCESS,
  });
  return res;
}

export function onUploadProgress(event) {
  logger.publish(4, 'files', 'onUploadProgress:res', event);
}

export async function onUploadError({ state, commit }, { resourceType, role, err }) {
  logger.publish(2, state.collectionName, 'dispatch:onUploadError:err', err);
  await commit('setUploadStatus', {
    resourceType,
    role,
    status: state.STATUS_FAILED,
  });
  return err;
}

export async function onFileImport(
  { state, commit, dispatch },
  { accessToken, resourceType, role, files, ownerId, name },
) {
  try {
    if (!resourceType || !role || !files) {
      throw new Error('Missing arguments');
    }
    const userId = ownerId && ownerId !== null ? ownerId : accessToken.userId;
    logger.publish(4, state.collectionName, 'dispatch:onFileImport:req', { ownerId, userId, role });
    await commit('setUploadStatus', {
      resourceType,
      role,
      status: state.STATUS_SAVING,
    });

    let url = `${process.env.VUE_APP_SERVER_URL}${process.env.VUE_APP_ROOT_API}/${
      state.collectionName
    }/${userId}/upload`;
    if (name && name !== null) {
      url = `${url}/${name}`;
    }

    const fileUpload = new FileUploadService(
      url,
      {
        'access-token': accessToken.id,
        authorization: accessToken.id,
      },
      onUploadProgress,
    );

    return fileUpload
      .upload(files)
      .then(res => dispatch('onUploadSuccess', { resourceType, role, res: res.target.response }))
      .catch(err => dispatch('onUploadError', { resourceType, role, err }));
  } catch (error) {
    return error;
  }
}

export async function uploadBuffer(
  { state, commit, dispatch },
  { resourceType, role, buffer, ownerId, name },
) {
  try {
    if (!resourceType || !role || !buffer || !ownerId || !name) {
      throw new Error('Missing arguments');
    }
    await commit('setUploadStatus', {
      resourceType,
      role,
      status: state.STATUS_SAVING,
    });
    //  console.log('uploadBuffer', buffer, ownerId);
    const config = {
      headers: {
        ['Content-Type']: `application/octet-stream`,
      },
    };
    const res = await loopback.post(
      `/${state.collectionName}/${ownerId}/upload-buffer/${name}`,
      buffer,
      config,
    );
    await dispatch('onUploadSuccess', { resourceType, role, res });
    return res;
  } catch (error) {
    dispatch('onUploadError', { resourceType, role, error });
    return error;
  }
}

export async function getFilesMetaByOwner({ state }, { ownerId, name, type }) {
  try {
    const filter = {
      where: {
        and: [{ ownerId }],
      },
      limit: 40,
    };
    if (name && name !== null) {
      filter.where.and.push({ name: { like: `.*${name}.*`, options: 'i' } });
    }
    if (type && type !== null) {
      filter.where.and.push({ type: { like: `.*${type}.*`, options: 'i' } });
    }

    const filesMeta = await loopback.find(`/${state.collectionName}`, filter);
    // console.log('filesMeta', filesMeta);
    if (filesMeta && filesMeta.length) {
      return filesMeta;
    }
    return [];
  } catch (error) {
    return error;
  }
}

export async function getFile({ state }, { ownerId, name }) {
  try {
    const file = await loopback.get(`/${state.collectionName}/${ownerId}/download/${name}`);
    if (file && file !== null) {
      return file;
    }
    return null;
  } catch (error) {
    return error;
  }
}

export async function updateFileMeta({ state }, { ownerType, fileMeta }) {
  try {
    if (!ownerType || ownerType !== 'users' || ownerType !== 'Devices') {
      throw new Error('mising params');
    }
    const fileMetaId = fileMeta.id;
    delete fileMeta.id;
    const updatedFileMeta = await loopback.put(`/${state.collectionName}/${fileMetaId}`, fileMeta);
    // const updatedFileMeta = await loopback.put(
    //   `/${ownerType}/${fileMeta.ownerId}/${state.collectionName}/${fileMetaId}`,
    //   fileMeta,
    // );
    if (updatedFileMeta && updatedFileMeta !== null) {
      return updatedFileMeta;
    }
    return null;
  } catch (error) {
    return error;
  }
}

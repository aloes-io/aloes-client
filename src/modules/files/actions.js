import loopback from '@/services/loopback';
import logger from '@/services/logger';

// Uploading audio and image files
export function onResetFileImport({ state, commit }, { resourceType, role }) {
  logger.publish(4, state.collectionName, 'dispatch:onResetFileImport:req', {
    resourceType,
    role,
  });
  commit('setUploadedFile', {
    resourceType,
    role,
    file: [],
  });
  commit('setUploadStatus', {
    resourceType,
    role,
    status: state.STATUS_INITIAL,
  });
}

export function onUploadSuccess({ state, commit }, { resourceType, role, file }) {
  logger.publish(4, state.collectionName, 'dispatch:onUploadSuccess:res', file);
  commit('setUploadedFileUrl', {
    resourceType,
    role,
    url: `${file.url}`,
  });
  commit('setUploadStatus', {
    resourceType,
    role,
    status: state.STATUS_SUCCESS,
  });
  return file;
}

export function onUploadProgress(event) {
  logger.publish(4, 'files', 'onUploadProgress:res', event);
}

export function onUploadError({ state, commit }, { resourceType, role, err }) {
  logger.publish(2, state.collectionName, 'dispatch:onUploadError:err', err);
  commit('setUploadStatus', {
    resourceType,
    role,
    status: state.STATUS_FAILED,
  });
  return err;
}

export async function onFileImport(
  { state, commit, dispatch },
  { resourceType, role, file, ownerId, name },
) {
  try {
    if (!resourceType || !role || !file || !name) {
      throw new Error('Missing arguments');
    }
    ownerId = ownerId.toString();
    logger.publish(4, state.collectionName, 'dispatch:onFileImport:req', { ownerId, role, name });
    commit('setUploadStatus', {
      resourceType,
      role,
      status: state.STATUS_SAVING,
    });
    const form = new FormData();
    form.append('file', file, name);
    const headers = {
      'Content-Type': 'multipart/form-data',
    };
    const res = await loopback.post(`/${state.resources}/${ownerId}/upload/${name}`, form, {
      headers,
    });
    dispatch('onUploadSuccess', { resourceType, role, file: res });
    return res;
  } catch (error) {
    dispatch('onUploadError', { resourceType, role, err: error });
    throw error;
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
    logger.publish(4, state.collectionName, 'dispatch:uploadBuffer:req', {
      name,
      ownerId,
    });
    commit('setUploadStatus', {
      resourceType,
      role,
      status: state.STATUS_SAVING,
    });
    const config = {
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      responseType: 'blob',
    };
    const file = await loopback.post(
      `/${state.resources}/${ownerId}/upload-buffer/${name}`,
      buffer,
      config,
    );
    dispatch('onUploadSuccess', { resourceType, role, file });
    return file;
  } catch (error) {
    dispatch('onUploadError', { resourceType, role, error });
    throw error;
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

    const filesMeta = await loopback.find(`/${state.resources}`, filter);
    if (filesMeta && filesMeta.length) {
      return filesMeta;
    }
    return [];
  } catch (error) {
    throw error;
  }
}

export async function download({ state }, url) {
  try {
    const file = await loopback.get(url, { responseType: 'blob' });
    if (file && file !== null) {
      return file;
    }
    return null;
  } catch (error) {
    logger.publish(4, state.collectionName, 'dispatch:download:err', error);
    return null;
  }
}

export async function getFile({ state }, { ownerId, name }) {
  try {
    const file = await loopback.get(`/${state.resources}/${ownerId}/download/${name}`, {
      responseType: 'blob',
    });
    if (file && file !== null) {
      return file;
    }
    return null;
  } catch (error) {
    logger.publish(4, state.collectionName, 'dispatch:getFile:err', error);
    return null;
  }
}

export async function updateFileMeta({ state }, { ownerType, fileMeta }) {
  try {
    if (!ownerType || ownerType.toLowerCase() !== 'user' || ownerType.toLowerCase() !== 'device') {
      throw new Error('missing params');
    }
    const fileMetaId = fileMeta.id;
    delete fileMeta.id;
    const updatedFileMeta = await loopback.put(`/${state.resources}/${fileMetaId}`, fileMeta);
    if (updatedFileMeta && updatedFileMeta !== null) {
      return updatedFileMeta;
    }
    return null;
  } catch (error) {
    throw error;
  }
}

/* Copyright 2019 Edouard Maleix, read LICENSE */

import loopback from '@/services/loopback';
import logger from '@/services/logger';

const userResources = 'users';

export async function loadTeams({ state, commit }, ownerId) {
  const teams = await loopback
    .get(`/${userResources}/${ownerId}/${state.resources.toLowerCase()}`)
    .then((res) => {
      logger.publish(4, state.collectionName, 'dispatch:loadTeams:res1', res);
      return res;
    })
    .catch((err) => err);
  await commit('setTeams', teams);
  return teams;
}

export async function loadTeamsProfiles({ state }, teams) {
  const memberIds = await teams.map((team) => team.memberId);
  return loopback
    .find(`${userResources}`, {
      where: { id: { inq: memberIds } },
      include: 'profileAddress',
    })
    .then((res) => {
      logger.publish(4, state.collectionName, 'dispatch:loadTeamsProfiles:res', res);
      return res;
    })
    .catch((err) => err);
}

export async function addTeamMember({ state, commit }, { ownerId, memberId }) {
  const team = {
    ownerId,
    memberId,
  };
  logger.publish(3, state.collectionName, 'dispatch:addTeamMember:req', team);
  const newTeam = await loopback
    .post(`/${userResources}/${ownerId}/${state.resources.toLowerCase()}/`, team)
    .then((res) => {
      logger.publish(3, state.collectionName, 'dispatch:addTeamMember:res', res);
      return res;
    })
    .catch((err) => err);
  commit('addTeamMember', newTeam);
  return newTeam;
}

export async function delTeamMember({ state, commit }, { ownerId, memberId }) {
  await loopback
    .delete(`/${userResources}/${ownerId}/${state.resources.toLowerCase()}/${memberId}`)
    .catch((err) => err);
  const deletedTeam = state.teams.find((team) => team.memberId === memberId);
  await logger.publish(3, state.collectionName, 'dispatch:delTeamMember:res', deletedTeam);
  commit('delTeamMember', deletedTeam);
  return deletedTeam;
}

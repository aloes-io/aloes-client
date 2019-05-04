import logger from '@/services/logger';

export function setTeams(state, teams) {
  state.collection = teams;
  logger.publish(4, state.collectionName, 'commit:setTeams:res', state.collection);
}

export function addTeamMember(state, team) {
  state.collection.push(team);
  logger.publish(4, state.collectionName, 'commit:addTeamMember:res', state.collection);
}

export function delTeamMember(state, team) {
  while (state.collection.indexOf(team) !== -1) {
    state.collection.splice(state.collection.indexOf(team), 1);
  }
  logger.publish(4, state.collectionName, 'commit:delTeamMember:res', state.collection);
}

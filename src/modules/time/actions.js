export function createYearsTable({ state }, date) {
  const year = date.getFullYear();
  for (let i = year; i > year - 30; i -= 1) {
    state.years.push({ text: i.toString(), value: i });
  }
  //  console.log('[TIME]', 'dispatch:createYearsTable:res', state.years);
  //  return commit('setYears', years);
}

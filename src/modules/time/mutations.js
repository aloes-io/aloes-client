export async function setYears(state, years) {
  state.years.push(years);
  //  console.log('[TIME]', 'commit:setYears:res', years);
}

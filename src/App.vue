<template>
  <router-view id="app" />
</template>

<script>
export default {
  created() {
    // Boot Application
    this.$store.dispatch("async/syncLoopback");
    if (this.$store.state.time.years.length < 2) {
      const date = new Date();
      this.$store.dispatch("time/createYearsTable", date);
    }
  }
};
</script>

<style lang="scss">
@import "style/app.scss";
</style>

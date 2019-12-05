<!-- Copyright 2019 Edouard Maleix, read LICENSE -->

<template>
  <router-view id="app" />
</template>

<script>
export default {
  created() {
    // Boot Application
    this.$store.dispatch('async/syncLoopback');
  },
};
</script>

<style lang="scss">
@import 'style/app.scss';
</style>

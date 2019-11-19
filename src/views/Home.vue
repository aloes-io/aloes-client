<!-- Copyright 2019 Edouard Maleix, read LICENSE -->

<template lang="html">
  <div class="home-view">
    <!-- Background  -->
    <div class="joli-bg">
      <div class="overlay" />
      <!--  <img
        :src="$store.state.style.pictures.background"
        class="bg"> -->
    </div>
    <header-container
      :access_token="$store.state.auth.access_token"
      :account="$store.state.auth.account"
    />
    <search-container
      v-if="
        $store.state.auth.access_token &&
          $store.state.auth.account &&
          $store.state.auth.account !== null
      "
      :user-id="$store.state.auth.access_token.userId"
      :token="$store.state.auth.access_token.id"
    />
    <home-container v-else />
    <footer-container />
  </div>
</template>

<script>
import HeaderContainer from '@/views/containers/HeaderContainer.vue';
import FooterContainer from '@/views/containers/FooterContainer.vue';
import HomeContainer from '@/views/containers/HomeContainer.vue';
import SearchContainer from '@/views/containers/SearchContainer.vue';

export default {
  name: 'Home',

  components: {
    'header-container': HeaderContainer,
    'footer-container': FooterContainer,
    'home-container': HomeContainer,
    'search-container': SearchContainer,
  },

  data() {
    return {};
  },

  mounted() {},

  methods: {},
};
</script>

<style lang="scss">
@import '../style/home.scss';
</style>

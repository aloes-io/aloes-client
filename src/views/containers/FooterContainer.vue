<template lang="html">
  <b-navbar :class="className" class="footer-container">
    <b-navbar-nav class="w-100">
      <b-nav-item :to="{ name: 'about', query: { tab: 'docs' } }" class="mr-auto">
        <small> Docs </small>
      </b-nav-item>
      <b-nav-item :href="$store.state.repoUrl" target="_blank">
        <small> Fork </small>
      </b-nav-item>
      <b-nav-item :to="{ name: 'about', query: { tab: 'contact' } }" class="mr-auto">
        <small> Contact </small>
      </b-nav-item>
    </b-navbar-nav>
  </b-navbar>
</template>

<script type="text/javascript">
import bNavbar from 'bootstrap-vue/es/components/navbar/navbar';
import bNavbarNav from 'bootstrap-vue/es/components/navbar/navbar-nav';
import bNavItem from 'bootstrap-vue/es/components/nav/nav-item';

export default {
  name: 'FooterContainer',

  components: {
    'b-navbar': bNavbar,
    'b-navbar-nav': bNavbarNav,
    'b-nav-item': bNavItem,
  },

  computed: {
    className() {
      if (this.$route.name === 'home') {
        return 'home';
      }
      return 'out';
    },
  },

  methods: {},
};
</script>

<style lang="scss" scoped>
@import '../../style/footer-container.scss';
</style>

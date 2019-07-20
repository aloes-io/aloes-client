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
import { BNavbar } from 'bootstrap-vue';
import { BNavbarNav } from 'bootstrap-vue';
import { BNavItem } from 'bootstrap-vue';

export default {
  name: 'FooterContainer',

  components: {
    'b-navbar': BNavbar,
    'b-navbar-nav': BNavbarNav,
    'b-nav-item': BNavItem,
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

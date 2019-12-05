<!-- Copyright 2019 Edouard Maleix, read LICENSE -->

<template lang="html">
  <div class="search-view">
    <header-container
      :access_token="$store.state.auth.access_token"
      :account="$store.state.auth.account"
    />
    <search-container v-if="accessToken" :token="accessToken" :user-id="userId" />
    <footer-container />
    <login-popup ref="loginPopup" />
  </div>
</template>

<script type="text/javascript">
import HeaderContainer from '@/views/containers/HeaderContainer.vue';
import FooterContainer from '@/views/containers/FooterContainer.vue';
import SearchContainer from '@/views/containers/SearchContainer.vue';

export default {
  name: 'Search',

  components: {
    'footer-container': FooterContainer,
    'header-container': HeaderContainer,
    'login-popup': () => import('@/views/containers/LoginPopup.vue'),
    'search-container': SearchContainer,
  },

  props: {
    'access-token': {
      type: String,
      default: '',
    },
    'user-id': {
      type: [String, Number],
      default: null,
    },
  },

  data() {
    return {};
  },

  computed: {
    accountType: {
      get() {
        return this.$store.state.auth.account.role.toLowerCase();
      },
    },
    results: {
      get() {
        return this.$store.state.search.results;
      },
    },
  },

  mounted() {
    if (!this.$store.state.auth.account) {
      this.$refs.loginPopup.showModal();
    }
  },

  methods: {},
};
</script>

<style lang="scss" scoped>
@import '../style/search.scss';
</style>

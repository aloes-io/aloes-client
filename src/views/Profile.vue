<template lang="html">
  <div class="profile-view">
    <header-container :access_token="$store.state.auth.access_token" :account="account" />
    <profile-container
      :account="account"
      :token="$store.state.auth.access_token.id"
      :profile-id="profileId"
      :profile-type="profileType"
      :is-viewer="true"
    />
    <footer-container />
    <login-popup ref="loginPopup" />
  </div>
</template>

<script type="text/javascript">
import HeaderContainer from '@/views/containers/HeaderContainer.vue';
import FooterContainer from '@/views/containers/FooterContainer.vue';
//  import LoginPopup from "@/views/containers/LoginPopup.vue";
import ProfileContainer from '@/views/containers/ProfileContainer.vue';

export default {
  name: 'Profile',

  components: {
    'footer-container': FooterContainer,
    'header-container': HeaderContainer,
    //  "login-popup": LoginPopup,
    'login-popup': () => import('@/views/containers/LoginPopup.vue'),
    'profile-container': ProfileContainer,
  },

  props: {
    'profile-id': {
      type: [String, Number],
      required: true,
      default: null,
    },
    'profile-type': {
      type: String,
      required: true,
      default: null,
    },
  },

  data() {
    return {};
  },

  computed: {
    account: {
      get() {
        return this.$store.state.auth.account;
      },
    },
    subscribeType: {
      get() {
        return this.$store.state.auth.account.subscribed;
      },
    },
  },

  mounted() {
    if (!this.account) {
      this.$refs.loginPopup.showModal();
    }
  },

  methods: {},
};
</script>

<style lang="scss" scoped>
@import '../style/account.scss';
</style>

<!-- Copyright 2019 Edouard Maleix, read LICENSE -->

<template lang="html">
  <div v-if="account" class="account-view">
    <header-container :access_token="$store.state.auth.access_token" :account="account" />
    <profile-container
      v-if="account"
      :account="account"
      :token="accessToken"
      :profile-type="account.role"
      :profile-id="account.id"
      :is-viewer="false"
    />
    <footer-container />
    <login-popup ref="loginPopup" />
  </div>
</template>

<script type="text/javascript">
import HeaderContainer from '@/views/containers/HeaderContainer.vue';
import FooterContainer from '@/views/containers/FooterContainer.vue';
import ProfileContainer from '@/views/containers/ProfileContainer.vue';

export default {
  name: 'Account',

  components: {
    'footer-container': FooterContainer,
    'header-container': HeaderContainer,
    'login-popup': () => import('@/views/containers/LoginPopup.vue'),
    'profile-container': ProfileContainer,
  },

  props: {
    'access-token': {
      type: String,
      default: '',
    },
    'user-id': {
      type: [String, Number],
      required: true,
    },
  },

  data() {
    return {
      showAgenda: false,
    };
  },

  computed: {
    account: {
      get() {
        return this.$store.state.auth.account;
      },
    },
  },

  mounted() {
    //  console.log('accesstoken', this.$props.accessToken);
    //  console.log('account', this.account);
    // if (!this.$store.state.auth.account) {
    //   return this.$refs.loginPopup.showModal();
    // }
    //  return null;
  },

  methods: {},
};
</script>

<style lang="scss" scoped>
@import '../style/account.scss';
</style>

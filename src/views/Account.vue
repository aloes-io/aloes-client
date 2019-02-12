<template lang="html">
  <div v-if="account" class="account-view">
    <header-container
      :access_token="$store.state.auth.access_token"
      :account="account"
    />
    <profile-container
      v-if="account && subscribeType !== 'new'"
      :account="account"
      :token="token"
      :profile-type="account.type"
      :profile-id="account.id"
      :is-viewer="false"
    />
    <footer-container />
    <login-popup ref="loginPopup" />
  </div>
</template>

<script type="text/javascript">
import HeaderContainer from "@/views/containers/HeaderContainer.vue";
import FooterContainer from "@/views/containers/FooterContainer.vue";
import ProfileContainer from "@/views/containers/ProfileContainer.vue";
//  import LoginPopup from "@/views/containers/LoginPopup.vue";

export default {
  name: "Account",

  components: {
    "footer-container": FooterContainer,
    "header-container": HeaderContainer,
    "login-popup": () => import("@/views/containers/LoginPopup.vue"),
    //  "login-popup": LoginPopup,
    "profile-container": ProfileContainer
  },

  props: {
    token: {
      type: String,
      default: ""
    },
    "user-id": {
      type: [String, Number],
      required: true
    }
  },

  data() {
    return {
      showAgenda: false
    };
  },

  computed: {
    account: {
      get() {
        return this.$store.state.auth.account;
      }
    },
    subscribeType: {
      get() {
        return this.$store.state.auth.account.subscribed;
      }
    }
    // profile: {
    //   get() {
    //     return this.$store.state[`${this.account.type.toLowerCase()}`].model;
    //   }
    // }
  },

  mounted() {
    if (!this.$store.state.auth.account) {
      return this.$refs.loginPopup.showModal();
    }
    return null;
  },

  methods: {}
};
</script>

<style lang="scss" scoped>
@import "../style/account.scss";
</style>

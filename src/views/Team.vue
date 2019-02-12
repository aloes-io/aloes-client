<template lang="html">
  <div class="team-view">
    <header-container
      :access_token="$store.state.auth.access_token"
      :account="$store.state.auth.account"
    />
    <team-container
      :account="$store.state.auth.account"
      :token="$store.state.auth.access_token.id"
    />
    <footer-container />
    <login-popup ref="loginPopup" />
  </div>
</template>

<script type="text/javascript">
import HeaderContainer from "@/views/containers/HeaderContainer.vue";
import FooterContainer from "@/views/containers/FooterContainer.vue";
import TeamContainer from "@/views/containers/TeamContainer.vue";
//  import LoginPopup from "@/views/containers/LoginPopup.vue";

export default {
  name: "Team",

  components: {
    "header-container": HeaderContainer,
    "footer-container": FooterContainer,
    "team-container": TeamContainer,
    //  "login-popup": LoginPopup
    "login-popup": () => import("@/views/containers/LoginPopup.vue")
  },

  props: {
    sessionError: {
      type: Error,
      default: null
    }
  },

  data() {
    return {};
  },

  mounted() {
    if (!this.$store.state.auth.account) {
      this.$refs.loginPopup.showModal();
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../style/team.scss";
</style>

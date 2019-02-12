<template lang="html">
  <div class="login-view">
    <div>
      <br />
      <b-card
        ref="loginView"
        :img-src="$store.state.style.pictures.logo"
        hide-header
        size="sm"
      >
        <login-master ref="loginMaster" />
      </b-card>
    </div>
    <footer-container />
  </div>
</template>

<script type="text/javascript">
import bCard from "bootstrap-vue/es/components/card/card";
import FooterContainer from "@/views/containers/FooterContainer.vue";
import LoginMaster from "@/components/Account/LoginMaster.vue";

export default {
  name: "Login",

  components: {
    "b-card": bCard,
    "footer-container": FooterContainer,
    "login-master": LoginMaster
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
    //  this.onReset();
  }
};
</script>

<style lang="scss" scoped>
@import "../style/login.scss";
</style>

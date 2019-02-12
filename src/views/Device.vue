<template lang="html">
  <div class="device-view">
    <header-container
      :access_token="$store.state.auth.access_token"
      :account="$store.state.auth.account"
    />
    <device-container
      :token="token"
      :user-id="userId"
      :is-viewer="false"
      :edit-mode="true"
    />
    <footer-container />
    <login-popup ref="loginPopup" />
  </div>
</template>

<script type="text/javascript">
import HeaderContainer from "@/views/containers/HeaderContainer.vue";
import FooterContainer from "@/views/containers/FooterContainer.vue";
import DeviceContainer from "@/views/containers/DeviceContainer.vue";
//  import LoginPopup from "@/views/containers/LoginPopup.vue";

export default {
  name: "Device",

  components: {
    "header-container": HeaderContainer,
    "footer-container": FooterContainer,
    "device-container": DeviceContainer,
    "login-popup": () => import("@/views/containers/LoginPopup.vue")
    //  "login-popup": LoginPopup
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
    return {};
  },

  mounted() {
    if (!this.$store.state.auth.account) {
      return this.$refs.loginPopup.showModal();
    }
  },

  beforeDestroy() {
    return this.$refs.loginPopup.hideModal();
  },

  methods: {}
};
</script>

<style lang="scss" scoped>
@import "../style/device.scss";
</style>

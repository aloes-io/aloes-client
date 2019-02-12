<template>
  <b-modal
    id="signup-popup"
    ref="signupPopup"
    hide-footer
    no-close-on-esc
    no-close-on-backdrop
    modal-class="header-popup-modal"
    body-class="header-popup-body"
    class="header-popup-view"
    @shown="onModalShown"
    @hidden="onModalHidden"
  >
    <img
      :src="$store.state.style.pictures.logo"
      alt="Aloes logo"
      class="header-popup-image"
    />
    <sign-up />
  </b-modal>
</template>

<script type="text/javascript">
import bModal from "bootstrap-vue/es/components/modal/modal";
import Signup from "@/components/Account/Signup.vue";

export default {
  name: "signupPopup",

  components: {
    "b-modal": bModal,
    "sign-up": Signup
  },

  props: {
    sessionError: {
      type: Error,
      default: null
    }
  },

  data() {
    return {
      newTabIndex: 0
    };
  },

  watch: {
    sessionError: {
      handler(err) {
        this.error = err;
      },
      immediate: true
    }
  },

  mounted() {
    //  console.log('login component', this);
  },

  methods: {
    onModalShown() {
      //  this.$refs.loginMaster.onReset();
    },

    onModalHidden() {
      //  this.$refs.signup.onReset();
    },

    hideModal() {
      // if (this.$route.name !== "home") {
      //   this.$router.push({ name: "home" });
      // }
      this.$refs.signupPopup.hide();
    },

    showModal() {
      this.$refs.signupPopup.show();
    }
  }
};
</script>

<style lang="scss">
@import "../../style/login-popup.scss";
</style>
